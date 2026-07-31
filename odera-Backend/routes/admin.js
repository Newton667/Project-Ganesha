const express = require('express');
const router = express.Router();
const verifyAdmin = require('./adminAuth');
const supabase = require('../config/supabaseAdminClient');

// ==============================
// PAGINATION HELPERS
// ==============================
const MAX_PAGE_SIZE = 200;

// Parses `page`/`pageSize` query params with sane defaults and clamps
// pageSize to MAX_PAGE_SIZE so a client can never force an unbounded fetch.
function getPagination(req, defaultPageSize) {
    let page = parseInt(req.query.page, 10);
    if (!Number.isInteger(page) || page < 1) page = 1;

    let pageSize = parseInt(req.query.pageSize, 10);
    if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = defaultPageSize;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return { page, pageSize, from, to };
}

// PostgREST returns PGRST103 ("Requested range not satisfiable") when the
// requested `range()` starts beyond the last row (e.g. a page number past
// the end of the data, common after rows are deleted between page loads).
// Treat that as a valid, simply-empty page instead of surfacing a 500.
async function runPaginatedQuery(buildQuery, { from, to }) {
    const { data, error, count } = await buildQuery().range(from, to);
    if (error && error.code === 'PGRST103') {
        const { count: totalCount, error: countError } = await buildQuery().range(0, 0);
        if (countError) throw countError;
        return { data: [], count: totalCount || 0 };
    }
    if (error) throw error;
    return { data, count };
}

// Protect all routes in this file with the adminAuth middleware
router.use(verifyAdmin);

// ==============================
// METRICS
// ==============================
router.get('/metrics', async (req, res) => {
    try {
        const results = await Promise.all([
            supabase.from('Employers').select('*', { count: 'exact', head: true }),
            supabase.from('Freelancers').select('*', { count: 'exact', head: true }),
            supabase.from('Jobs').select('*', { count: 'exact', head: true }),
            supabase.from('Contracts').select('*', { count: 'exact', head: true }),
            supabase.from('Messages').select('*', { count: 'exact', head: true })
        ]);

        // Explicitly check for DB errors, otherwise destructuring fails silently
        const dbError = results.find(r => r.error)?.error;
        if (dbError) throw dbError;
        
        const [employers, freelancers, jobs, contracts, messages] = results;

        res.json({
            totalUsers: (employers.count || 0) + (freelancers.count || 0),
            employersCount: employers.count,
            freelancersCount: freelancers.count,
            jobsCount: jobs.count,
            contractsCount: contracts.count,
            messagesCount: messages.count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// USERS CRUD (Via GoTrue Admin API)
// ==============================
router.get('/users', async (req, res) => {
    try {
        const { page, pageSize } = getPagination(req, 50);
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize });
        if (error) throw error;

        // GoTrue only reports a real total when there is more than one page
        // (it derives it from the `Link` response header). When it's missing:
        //   - on page 1, this page's own length IS the total (there's only one page).
        //   - on page > 1, an empty/short page here doesn't tell us the true
        //     total (it may just be a stale/out-of-range page after deletes),
        //     so re-check page 1 to get an authoritative count instead of
        //     guessing from `(page - 1) * pageSize + data.users.length`, which
        //     silently under/over-counts once you're past the real last page.
        let total = data.total;
        if (!total) {
            if (page === 1) {
                total = data.users.length;
            } else {
                const { data: firstPage, error: firstPageError } = await supabase.auth.admin.listUsers({ page: 1, perPage: pageSize });
                if (firstPageError) throw firstPageError;
                total = firstPage.total || firstPage.users.length;
            }
        }
        res.json({ data: data.users, page, pageSize, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        // Note: For this to work smoothly, ensure your Foreign Keys in Employer/Freelancer 
        // tables have "ON DELETE CASCADE" enabled in Supabase.
        const { error } = await supabase.auth.admin.deleteUser(req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// DASHBOARD DATA LISTS
// ==============================
router.get('/jobs', async (req, res) => {
    try {
        const { page, pageSize, from, to } = getPagination(req, 50);
        const buildQuery = () => supabase.from('Jobs').select('*', { count: 'exact' }).order('JobCreated', { ascending: false });
        const { data, count } = await runPaginatedQuery(buildQuery, { from, to });
        res.json({ data, page, pageSize, total: count });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/contracts', async (req, res) => {
    try {
        const { page, pageSize, from, to } = getPagination(req, 50);
        const buildQuery = () => supabase.from('Contracts').select('*', { count: 'exact' });
        const { data, count } = await runPaginatedQuery(buildQuery, { from, to });
        res.json({ data, page, pageSize, total: count });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/messages', async (req, res) => {
    try {
        const { page, pageSize, from, to } = getPagination(req, 50);
        const buildQuery = () => supabase.from('Messages').select('*', { count: 'exact' }).order('timestamp', { ascending: false });
        const { data, count } = await runPaginatedQuery(buildQuery, { from, to });
        res.json({ data, page, pageSize, total: count });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==============================
// JOBS, CONTRACTS, MESSAGES ACTION ROUTES
// ==============================
router.put('/jobs/:id', async (req, res) => {
    try {
        const { JobTitle } = req.body;
        if (typeof JobTitle !== 'string' || !JobTitle.trim()) {
            return res.status(400).json({ error: 'JobTitle is required and must be a non-empty string' });
        }
        const { error } = await supabase.from('Jobs').update({ JobTitle: JobTitle.trim() }).eq('JobID', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/jobs/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('Jobs').delete().eq('JobID', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/contracts/:id/revoke', async (req, res) => {
    try {
        const { error } = await supabase.from('Contracts').update({ Status: 'Revoked' }).eq('ContractID', req.params.id);
        if (error) throw error; res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/messages/:id', async (req, res) => {
    try {
        const { content } = req.body;
        if (typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'content is required and must be a non-empty string' });
        }
        const { error } = await supabase.from('Messages').update({ content: content.trim() }).eq('messageid', req.params.id);
        if (error) throw error; res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/messages/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('Messages').delete().eq('messageid', req.params.id);
        if (error) throw error; res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
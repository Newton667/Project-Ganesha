const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const verifyAdmin = require('./adminAuth');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        res.json(data.users);
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
        const { data, error } = await supabase.from('Jobs').select('*').order('JobCreated', { ascending: false }).limit(50);
        if (error) throw error; 
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/contracts', async (req, res) => {
    try {
        const { data, error } = await supabase.from('Contracts').select('*').limit(50);
        if (error) throw error; 
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/messages', async (req, res) => {
    try {
        const { data, error } = await supabase.from('Messages').select('*').order('timestamp', { ascending: false }).limit(50);
        if (error) throw error; 
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==============================
// JOBS, CONTRACTS, MESSAGES ACTION ROUTES
// ==============================
router.put('/jobs/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('Jobs').update({ JobTitle: req.body.JobTitle }).eq('JobID', req.params.id);
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
        const { error } = await supabase.from('Messages').update({ content: req.body.content }).eq('messageid', req.params.id);
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
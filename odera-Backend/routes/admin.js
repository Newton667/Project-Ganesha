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
        const [
            { count: employersCount },
            { count: freelancersCount },
            { count: jobsCount },
            { count: contractsCount },
            { count: messagesCount }
        ] = await Promise.all([
            supabase.from('Employers').select('*', { count: 'exact', head: true }),
            supabase.from('Freelancers').select('*', { count: 'exact', head: true }),
            supabase.from('Jobs').select('*', { count: 'exact', head: true }),
            supabase.from('Contracts').select('*', { count: 'exact', head: true }),
            supabase.from('Messages').select('*', { count: 'exact', head: true })
        ]);

        res.json({
            totalUsers: (employersCount || 0) + (freelancersCount || 0),
            employersCount,
            freelancersCount,
            jobsCount,
            contractsCount,
            messagesCount
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
// JOBS CRUD Example (Standard Table)
// ==============================
router.delete('/jobs/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('Jobs').delete().eq('JobID', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
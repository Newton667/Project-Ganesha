// Uses the shared service-role client so queries can reach the Admins table
// without being blocked by RLS.
const supabase = require('../config/supabaseAdminClient');

async function verifyAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

        const token = authHeader.replace('Bearer ', '');

        // 1. Verify the user's token via Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

        // 2. Check if the user exists in the Admins table
        const { data: admin, error: adminError } = await supabase
            .from('admins')
            .select('adminid')
            .eq('adminid', user.id)
            .single();

        if (adminError || !admin) return res.status(403).json({ error: 'Forbidden: Admin access required' });

        next(); // User is verified as an Admin, proceed to the route
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error during admin verification' });
    }
}

module.exports = verifyAdmin;
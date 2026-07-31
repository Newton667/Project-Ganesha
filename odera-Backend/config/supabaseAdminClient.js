require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');

// Uses the SERVICE_ROLE_KEY so queries bypass RLS. This is the single,
// auditable place in the backend that references SUPABASE_SERVICE_ROLE_KEY.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabaseAdmin;

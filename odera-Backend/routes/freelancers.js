const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');
const express = require('express');
const router = express.Router();

/* GET FreelancerProfile listing. */
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('FreelancerProfile')
    .select('*')
    .eq('FreelancerID', userId);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

module.exports = router;

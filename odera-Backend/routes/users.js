const supabase = require('../config/supabaseClient');
const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('Freelancers')    // 👈 replace with your actual table name
      .select('*');     // select all columns

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send('Error fetching table');
    }

    res.json(data); // Return as JSON
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;

const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');
const express = require('express');
const router = express.Router();

/* POST add user to employers table. */
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { Fname, Lname, email } = req.body;

  const { error } = await supabase
    .from('Employers')
    .insert({
        EmployerID: userId,
        FirstName: Fname,
        LastName: Lname,
        Email: email
    });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});


module.exports = router;

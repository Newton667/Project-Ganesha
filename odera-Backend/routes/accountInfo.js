// routes/accountInfo.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');

/**
 * GET /api/account-info
 * Returns the user's account type (Employer, Freelancer, or Both) and creation date
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    console.log('[account-info] Looking up user:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is an employer
    const { data: employer, error: employerError } = await supabase
      .from('Employers')
      .select('EmployerID, AccountCreated')
      .eq('EmployerID', userId)
      .maybeSingle();

    console.log('[account-info] Employer lookup:', { employer, employerError });

    if (employerError) {
      console.error('[GET /account-info] employer lookup error:', employerError);
    }

    // Check if user is a freelancer
    const { data: freelancer, error: freelancerError } = await supabase
      .from('Freelancers')
      .select('FreelancerID, AccountCreated')
      .eq('FreelancerID', userId)
      .maybeSingle();

    console.log('[account-info] Freelancer lookup:', { freelancer, freelancerError });

    if (freelancerError) {
      console.error('[GET /account-info] freelancer lookup error:', freelancerError);
    }

    // Determine account type
    let accountType = 'Unknown';
    let accountCreated = null;

    if (employer && freelancer) {
      accountType = 'Both';
      // Use the earlier creation date
      const employerDate = new Date(employer.AccountCreated);
      const freelancerDate = new Date(freelancer.AccountCreated);
      accountCreated = employerDate < freelancerDate ? employer.AccountCreated : freelancer.AccountCreated;
    } else if (employer) {
      accountType = 'Employer';
      accountCreated = employer.AccountCreated;
    } else if (freelancer) {
      accountType = 'Freelancer';
      accountCreated = freelancer.AccountCreated;
    }

    console.log('[account-info] Result:', { accountType, accountCreated });

    res.json({
      accountType,
      accountCreated,
      isEmployer: !!employer,
      isFreelancer: !!freelancer
    });

  } catch (e) {
    console.error('[GET /account-info] unhandled:', e);
    res.status(500).json({ error: 'Failed to fetch account info' });
  }
});

module.exports = router;

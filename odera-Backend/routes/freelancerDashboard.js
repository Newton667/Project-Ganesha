const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');
const express = require('express');
const router = express.Router();
const dayjs = require('dayjs'); // optional: for readable timestamps
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

router.get('/', authMiddleware, async (req, res) => {
  const freelancerId = req.user.id;


  // 0. Get firstname and lastname from table
  // Fetch freelancer basic data (e.g., name)
  const { data: freelancerData, error: freelancerError } = await supabase
    .from('Freelancers') // <-- Replace with actual table name if different
    .select('FirstName, LastName') // <-- Adjust field names if needed
    .eq('FreelancerID', freelancerId)
    .single();

  if (freelancerError) return res.status(500).json({ error: freelancerError.message });

  // 1. Get freelancer profile
  // Combines freelancer and freelancerProfile
  const { data: profileData, error: profileError } = await supabase
    .from('FreelancerProfile')
    .select('*')
    .eq('FreelancerID', freelancerId)
    .single();

  if (profileError) return res.status(500).json({ error: profileError.message });

  // 2. Get active contracts
  // Filters by looking for jobs that are In-Progress and taken by the logged in user
  const { data: contractsData, error: contractsError } = await supabase
    .from('Contracts')
    .select(`
      ContractID,
      JobID,
      Status,
      Progress,
      PricingMin,
      PricingMax,
      LastUpdate,
      Jobs (
        JobTitle,
        EmployerID,
        BudgetMax,
        Duration
      ),
      ProjectMilestones (
        IsComplete
      ),
      Employers (
        CompanyName
      )
    `)
    .eq('FreelancerID', freelancerId)
    .in('Status', ['In Progress', 'Active']);

  if (contractsError) return res.status(500).json({ error: contractsError.message });

  // Format active projects
  const activeProjects = contractsData.map(contract => {
    const completed = contract.ProjectMilestones?.filter(m => m.IsComplete).length || 0;
    const total = contract.ProjectMilestones?.length || 0;

    return {
      id: contract.ContractID,
      title: contract.Jobs?.JobTitle,
      client: contract.Employers?.CompanyName || 'Unknown',
      progress: contract.Progress || 0,
      budget: contract.Jobs?.BudgetMax || contract.PricingMax || 0,
      deadline: contract.Jobs?.Duration,
      status: contract.Status,
      lastUpdate: dayjs(contract.LastUpdate).fromNow(),
      milestones: {
        completed,
        total
      }
    };
  });

  // 3. Get total earnings
  // Simple enough, sum all earnings from payments table with userID
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('Payments')
    .select('AmountPaid, PaymentTimestamp')
    .eq('PayeeID', freelancerId);

  if (paymentsError) return res.status(500).json({ error: paymentsError.message });

  const totalEarnings = paymentsData.reduce((sum, p) => sum + p.AmountPaid, 0);

  // Earnings chart data by month
  const monthlyEarnings = {};
  for (let i = 0; i < 6; i++) {
    const month = dayjs().subtract(i, 'month').format('MMM');
    monthlyEarnings[month] = 0;
  }
  paymentsData.forEach(p => {
    const month = dayjs(p.PaymentTimestamp).format('MMM');
    if (monthlyEarnings[month] !== undefined) {
      monthlyEarnings[month] += p.AmountPaid;
    }
  });

  const earningsData = Object.entries(monthlyEarnings)
    .reverse()
    .map(([month, amount]) => ({ month, amount }));

  // 4. Available opportunities (Jobs with no FreelancerID assigned)
  const { data: openJobs, error: openJobsError } = await supabase
    .from('Jobs')
    .select('*')
    .is('FreelancerID', null)
    .limit(10);

  if (openJobsError) return res.status(500).json({ error: openJobsError.message });

  const opportunities = openJobs.map(job => ({
    id: job.JobID,
    title: job.JobTitle,
    budget: `$${job.BudgetMin} - $${job.BudgetMax}`,
    duration: job.Duration,
    skills: [], // requires joining JobSkills
    proposals: 0, // can join JobApplications to count
    posted: dayjs(job.JobCreated).fromNow(),
    client: 'Anonymous',
    urgency: job.Urgency || 'medium'
  }));

  // 5. TODO: Recent messages (mock or use a messages table)

  // Final response
  res.json({
    userData: {
      name: `${freelancerData.FirstName} ${freelancerData.LastName}`,
      profileCompletion: profileData.ProfileCompletion || 0,
      totalEarnings: totalEarnings,
      activeProjects: profileData.ActiveProjects || activeProjects.length,
      completedProjects: profileData.CompletedProjects || 0,
      rating: profileData.Rating || 0,
      responseTime: profileData.ResponseTime || 'Unknown',
      availability: profileData.Availability || 'Unavailable'
    },
    activeProjects,
    messages: [], // Placeholder
    opportunities,
    earningsData
  });
});

module.exports = router;

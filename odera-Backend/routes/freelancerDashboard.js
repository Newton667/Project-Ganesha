// routes/freelancerDashboard.js
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');
const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

router.get('/', authMiddleware, async (req, res) => {
  const freelancerId = req.user?.id;
  if (!freelancerId) return res.status(401).json({ error: 'No user id' });

  try {
    // 0) Name (tolerate missing)
    const { data: freelancerData, error: freelancerError } = await supabase
      .from('Freelancers')
      .select('FirstName, LastName')
      .eq('FreelancerID', freelancerId)
      .maybeSingle(); // ← no throw on not found

    if (freelancerError) console.error('Freelancers err:', freelancerError);

    if (!freelancerData) {
      return res.status(403).json({ error: 'Access denied: You do not have a freelancer account.' });
    }

    // 1) Profile (tolerate missing)
    const { data: profileData, error: profileError } = await supabase
      .from('FreelancerProfile')
      .select('*')
      .eq('FreelancerID', freelancerId)
      .maybeSingle();

    if (profileError) console.error('Profile err:', profileError);

    // 2) Active contracts (tolerate empty)
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
        Jobs ( JobTitle, EmployerID, BudgetMax, Duration ),
        ProjectMilestones ( IsComplete ),
        Employers ( CompanyName )
      `)
      .eq('FreelancerID', freelancerId)
      .in('Status', ['In Progress', 'Active']);

    if (contractsError) console.error('Contracts err:', contractsError);

    const activeProjects = (contractsData || []).map((c) => {
      const milestones = c?.ProjectMilestones || [];
      const completed = milestones.filter((m) => m?.IsComplete).length;
      const total = milestones.length;
      return {
        id: c?.ContractID,
        title: c?.Jobs?.JobTitle || 'Untitled',
        client: c?.Employers?.CompanyName || 'Unknown',
        progress: num(c?.Progress),
        budget: num(c?.Jobs?.BudgetMax ?? c?.PricingMax),
        deadline: c?.Jobs?.Duration || '—',
        status: c?.Status || '—',
        lastUpdate: c?.LastUpdate ? dayjs(c.LastUpdate).fromNow() : '—',
        milestones: { completed, total },
      };
    });

    // 3) Earnings (tolerate empty)
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('Payments')
      .select('AmountPaid, PaymentTimestamp')
      .eq('PayeeID', freelancerId);

    if (paymentsError) console.error('Payments err:', paymentsError);

    const totalEarnings = (paymentsData || []).reduce(
      (sum, p) => sum + num(p?.AmountPaid),
      0
    );

    const monthly = {};
    for (let i = 0; i < 6; i++) monthly[dayjs().subtract(i, 'month').format('MMM')] = 0;
    (paymentsData || []).forEach((p) => {
      const m = dayjs(p?.PaymentTimestamp).format('MMM');
      if (m in monthly) monthly[m] += num(p?.AmountPaid);
    });
    const earningsData = Object.entries(monthly).reverse().map(([month, amount]) => ({ month, amount }));

    // 4) Open jobs (tolerate empty)
    const { data: openJobs, error: openJobsError } = await supabase
      .from('Jobs')
      .select('*')
      .is('FreelancerID', null)
      .order('JobCreated', { ascending: false })
      .limit(10);

    if (openJobsError) console.error('OpenJobs err:', openJobsError);

    const opportunities = (openJobs || []).map((j) => ({
      id: j?.JobID,
      title: j?.JobTitle || 'Untitled',
      budget: `$${num(j?.BudgetMin)} - $${num(j?.BudgetMax)}`,
      duration: j?.Duration || '—',
      skills: [],
      proposals: 0,
      posted: j?.JobCreated ? dayjs(j.JobCreated).fromNow() : '—',
      client: 'Anonymous',
      urgency: j?.Urgency || 'medium',
    }));

    // Final payload (always the same shape)
    res.json({
      userData: {
        name: `${freelancerData?.FirstName || 'User'} ${freelancerData?.LastName || ''}`.trim(),
        profileCompletion: profileData?.ProfileCompletion ?? 0,
        totalEarnings,
        activeProjects: profileData?.ActiveProjects ?? activeProjects.length,
        completedProjects: profileData?.CompletedProjects ?? 0,
        rating: profileData?.Rating ?? 0,
        responseTime: profileData?.ResponseTime ?? 'Unknown',
        availability: profileData?.Availability ?? 'Unavailable',
      },
      activeProjects,
      messages: [],
      opportunities,
      earningsData,
    });
  } catch (err) {
    console.error('[freelancerDashboard] unhandled:', err);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

module.exports = router;

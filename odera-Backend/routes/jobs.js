// routes/jobs.js
const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * GET /jobs
 * Query params (all optional):
 * - q: text search in JobTitle/JobDesc
 * - cat: exact JobCat match
 * - urgency: exact Urgency match
 * - minBudget, maxBudget: numeric filters (match against BudgetMin/BudgetMax)
 * - employerId: limit to a single employer's jobs
 * - onlyOpen: "true" to only return unassigned jobs (FreelancerID IS NULL)
 * - page (1-based), limit (default 10)
 * - orderBy: "JobCreated" | "BudgetMax" | "BudgetMin" | "JobPrice"
 * - dir: "asc" | "desc" (default desc)
 */
router.get('/', async (req, res) => {
  try {
    const {
      q,
      cat,
      urgency,
      minBudget,
      maxBudget,
      employerId,
      onlyOpen,
      page = 1,
      limit = 10,
      orderBy = 'JobCreated',
      dir = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('Jobs')
      .select('*', { count: 'exact' });

    // Filters
    if (q && String(q).trim()) {
      // Search in title or description
      query = query.or(`JobTitle.ilike.%${q}%,JobDesc.ilike.%${q}%`);
    }
    if (cat) query = query.eq('JobCat', cat);
    if (urgency) query = query.eq('Urgency', urgency);
    if (employerId) query = query.eq('EmployerID', employerId);
    if (String(onlyOpen).toLowerCase() === 'true') {
      query = query.is('FreelancerID', null);
    }
    if (minBudget) {
      const v = Number(minBudget);
      if (!Number.isNaN(v)) query = query.gte('BudgetMax', v); // ensure top of range meets min
    }
    if (maxBudget) {
      const v = Number(maxBudget);
      if (!Number.isNaN(v)) query = query.lte('BudgetMin', v); // ensure bottom of range within max
    }

    // Sort + paginate
    query = query.order(orderBy, { ascending: String(dir).toLowerCase() === 'asc' }).range(from, to);

    const { data, error, count } = await query;
    if (error) {
      console.error('[GET /jobs] supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }

    // Normalize output a bit
    const jobs = (data || []).map((j) => ({
      id: j.JobID,
      title: j.JobTitle || 'Untitled',
      desc: j.JobDesc || '',
      category: j.JobCat || null,
      urgency: j.Urgency || null,
      employerId: j.EmployerID || null,
      freelancerId: j.FreelancerID || null,
      duration: j.Duration || null,
      price: num(j.JobPrice),
      budget: { min: num(j.BudgetMin), max: num(j.BudgetMax) },
      createdAt: j.JobCreated,
      posted: j.JobCreated ? dayjs(j.JobCreated).fromNow() : null,
    }));

    res.json({
      page: pageNum,
      limit: pageSize,
      total: count ?? jobs.length,
      jobs,
    });
  } catch (e) {
    console.error('[GET /jobs] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

// routes/jobs.js

router.post('/createjob', authMiddleware, async (req, res) => {
  try {
    const employerId = req.user.id; // from authMiddleware (supabase JWT user id) 

    const {
      title,
      desc,
      category,
      urgency,
      duration,
      price,
      budgetMin,
      budgetMax,
    } = req.body;

    // Basic validation
    if (!title || !desc || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('Jobs')
      .insert([
        {
          EmployerID: employerId,
          JobTitle: title,
          JobDesc: desc,
          JobCat: category,
          Urgency: urgency || null,
          Duration: duration || null,
          JobPrice: Number(price) || 0,
          BudgetMin: Number(budgetMin) || 0,
          BudgetMax: Number(budgetMax) || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[POST /jobs/createjob] supabase error:', error);
      return res.status(500).json({ error: 'Failed to create job' });
    }

    res.status(201).json({
      id: data.JobID,
      message: 'Job created successfully',
    });
  } catch (e) {
    console.error('[POST /jobs/createjob] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});


/**
 * GET /jobs/:id  — fetch a single job by JobID
 * If you want this restricted (e.g., only the employer who owns it), add authMiddleware and a check.
 */
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const { data, error } = await supabase
      .from('Jobs')
      .select('*')
      .eq('JobID', jobId)
      .maybeSingle();

    if (error) {
      console.error('[GET /jobs/:id] supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch job' });
    }
    if (!data) return res.status(404).json({ error: 'Job not found' });

    const j = data;
    res.json({
      id: j.JobID,
      title: j.JobTitle || 'Untitled',
      desc: j.JobDesc || '',
      category: j.JobCat || null,
      urgency: j.Urgency || null,
      employerId: j.EmployerID || null,
      freelancerId: j.FreelancerID || null,
      duration: j.Duration || null,
      price: num(j.JobPrice),
      budget: { min: num(j.BudgetMin), max: num(j.BudgetMax) },
      createdAt: j.JobCreated,
      posted: j.JobCreated ? dayjs(j.JobCreated).fromNow() : null,
    });
  } catch (e) {
    console.error('[GET /jobs/:id] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

module.exports = router;

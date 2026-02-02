// routes/jobApplications.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');

/**
 * POST /api/jobs/:id/apply
 * Submit an application/interest for a job
 * Only freelancers can apply
 */
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is a freelancer
    const { data: freelancer, error: freelancerError } = await supabase
      .from('Freelancers')
      .select('FreelancerID')
      .eq('FreelancerID', userId)
      .maybeSingle();

    if (freelancerError) {
      console.error('[POST /jobs/:id/apply] freelancer lookup error:', freelancerError);
      return res.status(500).json({ error: 'Failed to verify freelancer status' });
    }

    if (!freelancer) {
      return res.status(403).json({ error: 'Only freelancers can apply to jobs' });
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('Jobs')
      .select('JobID, EmployerID, FreelancerID')
      .eq('JobID', jobId)
      .maybeSingle();

    if (jobError) {
      console.error('[POST /jobs/:id/apply] job lookup error:', jobError);
      return res.status(500).json({ error: 'Failed to fetch job' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is already taken
    if (job.FreelancerID) {
      return res.status(400).json({ error: 'This job has already been assigned' });
    }

    // Check if user is the job poster
    if (job.EmployerID === userId) {
      return res.status(400).json({ error: 'You cannot apply to your own job' });
    }

    // Check if user has already applied
    const { data: existingApp, error: existingError } = await supabase
      .from('JobApplications')
      .select('ApplicationID')
      .eq('JobID', jobId)
      .eq('FreelancerID', userId)
      .maybeSingle();

    if (existingError) {
      console.error('[POST /jobs/:id/apply] existing application lookup error:', existingError);
    }

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    // Extract application data from request body
    const { proposalText, experience, timeline, coverLetter } = req.body;

    if (!proposalText || !String(proposalText).trim()) {
      return res.status(400).json({ error: 'Proposal text is required' });
    }

    // Insert the application
    const { data: newApplication, error: insertError } = await supabase
      .from('JobApplications')
      .insert({
        JobID: jobId,
        FreelancerID: userId,
        ProposalText: String(proposalText).trim(),
        Experience: experience ? String(experience).trim() : null,
        Timeline: timeline ? String(timeline).trim() : null,
        CoverLetter: coverLetter ? String(coverLetter).trim() : null,
        Status: 'Pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('[POST /jobs/:id/apply] insert error:', insertError);
      return res.status(500).json({ error: 'Failed to submit application' });
    }

    res.status(201).json({
      success: true,
      applicationId: newApplication.ApplicationID,
      message: 'Application submitted successfully'
    });

  } catch (e) {
    console.error('[POST /jobs/:id/apply] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

/**
 * GET /api/jobs/:id/applications
 * Get all applications for a job (employer only)
 */
router.get('/:id/applications', authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is the job owner
    const { data: job, error: jobError } = await supabase
      .from('Jobs')
      .select('JobID, EmployerID')
      .eq('JobID', jobId)
      .maybeSingle();

    if (jobError) {
      console.error('[GET /jobs/:id/applications] job lookup error:', jobError);
      return res.status(500).json({ error: 'Failed to fetch job' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.EmployerID !== userId) {
      return res.status(403).json({ error: 'Only the job poster can view applications' });
    }

    // Fetch applications with freelancer info
    const { data: applications, error: appsError } = await supabase
      .from('JobApplications')
      .select(`
        ApplicationID,
        ProposalText,
        Experience,
        Timeline,
        CoverLetter,
        Status,
        FreelancerID,
        Freelancers (
          FirstName,
          LastName,
          Email
        )
      `)
      .eq('JobID', jobId)
      .order('ApplicationID', { ascending: false });

    if (appsError) {
      console.error('[GET /jobs/:id/applications] fetch error:', appsError);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }

    // Normalize the response
    const normalizedApps = (applications || []).map(app => ({
      id: app.ApplicationID,
      proposalText: app.ProposalText,
      experience: app.Experience,
      timeline: app.Timeline,
      coverLetter: app.CoverLetter,
      status: app.Status,
      freelancer: app.Freelancers ? {
        id: app.FreelancerID,
        firstName: app.Freelancers.FirstName,
        lastName: app.Freelancers.LastName,
        email: app.Freelancers.Email
      } : null
    }));

    res.json({
      jobId,
      applications: normalizedApps,
      total: normalizedApps.length
    });

  } catch (e) {
    console.error('[GET /jobs/:id/applications] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

module.exports = router;

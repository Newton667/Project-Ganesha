const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');
const express = require('express');
const router = express.Router();

/* POST job application */
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const {
    JobID,
    ProposalText,
    CoverLetter,
    Experience,
    Timeline,
    Status
  } = req.body;

  // Validate required fields
  if (!JobID || !ProposalText) {
    return res.status(400).json({ 
      error: 'JobID and ProposalText are required' 
    });
  }

  // Check if user already applied to this job
  const { data: existingApplication } = await supabase
    .from('JobApplications')
    .select('ApplicationID')
    .eq('JobID', JobID)
    .eq('FreelancerID', userId)
    .single();
  
  if (existingApplication) {
    return res.status(409).json({ error: 'You have already applied to this job' });
  }

  // Insert the new job application
  const { error } = await supabase
    .from('JobApplications')
    .insert({
      JobID,
      FreelancerID: userId,
      ProposalText,
      CoverLetter: CoverLetter || null,
      Experience: Experience || null,
      Timeline: Timeline || null,
      Status: Status || 'Pending'
    });

  if (error) return res.status(500).json({ error: error.message });
  
  res.json({ success: true, message: 'Application submitted successfully' });
});

/* GET job applications for authenticated user */
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  const { data: applications, error } = await supabase
    .from('JobApplications')
    .select(`
      ApplicationID,
      JobID,
      ProposalText,
      CoverLetter,
      Experience,
      Timeline,
      Status,
      Jobs!inner (
        JobTitle,
        JobDesc,
        JobPrice,
        Employers!inner (
          FirstName,
          LastName
        )
      )
    `)
    .eq('FreelancerID', userId)
    .order('ApplicationID', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Flatten the nested structure
  const flattenedApplications = applications.map(app => ({
    ...app,
    JobTitle: app.Jobs.JobTitle,
    JobDesc: app.Jobs.JobDesc,
    JobPrice: app.Jobs.JobPrice,
    EmployerFirstName: app.Jobs.Employers.FirstName,
    EmployerLastName: app.Jobs.Employers.LastName,
    Jobs: undefined
  }));
  
  res.json({ applications: flattenedApplications });
});

/* GET specific job application */
router.get('/:applicationId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { applicationId } = req.params;

  const { data: application, error } = await supabase
    .from('JobApplications')
    .select(`
      *,
      Jobs!inner (
        JobTitle,
        JobDesc,
        JobPrice,
        Employers!inner (
          FirstName,
          LastName
        )
      )
    `)
    .eq('ApplicationID', applicationId)
    .eq('FreelancerID', userId)
    .single();

  if (error || !application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Flatten the structure
  const flattenedApplication = {
    ...application,
    JobTitle: application.Jobs.JobTitle,
    JobDesc: application.Jobs.JobDesc,
    JobPrice: application.Jobs.JobPrice,
    EmployerFirstName: application.Jobs.Employers.FirstName,
    EmployerLastName: application.Jobs.Employers.LastName,
    Jobs: undefined
  };

  res.json({ application: flattenedApplication });
});

/* PUT update job application */
router.put('/:applicationId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { applicationId } = req.params;
  const {
    ProposalText,
    CoverLetter,
    Experience,
    Timeline
  } = req.body;

  // Check if application exists and belongs to user
  const { data: existingApp, error: checkError } = await supabase
    .from('JobApplications')
    .select('Status')
    .eq('ApplicationID', applicationId)
    .eq('FreelancerID', userId)
    .single();
  
  if (checkError || !existingApp) {
    return res.status(404).json({ error: 'Application not found' });
  }

  if (existingApp.Status !== 'Pending') {
    return res.status(400).json({ 
      error: 'Cannot update application that is no longer pending' 
    });
  }

  // Prepare update object
  const updateData = {};
  if (ProposalText !== undefined) updateData.ProposalText = ProposalText;
  if (CoverLetter !== undefined) updateData.CoverLetter = CoverLetter;
  if (Experience !== undefined) updateData.Experience = Experience;
  if (Timeline !== undefined) updateData.Timeline = Timeline;

  const { error } = await supabase
    .from('JobApplications')
    .update(updateData)
    .eq('ApplicationID', applicationId)
    .eq('FreelancerID', userId);

  if (error) return res.status(500).json({ error: error.message });
  
  res.json({ success: true, message: 'Application updated successfully' });
});

/* DELETE job application */
router.delete('/:applicationId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { applicationId } = req.params;

  // Check if application exists and is still pending
  const { data: existingApp, error: checkError } = await supabase
    .from('JobApplications')
    .select('Status')
    .eq('ApplicationID', applicationId)
    .eq('FreelancerID', userId)
    .single();
  
  if (checkError || !existingApp) {
    return res.status(404).json({ error: 'Application not found' });
  }

  if (existingApp.Status !== 'Pending') {
    return res.status(400).json({ 
      error: 'Cannot delete application that is no longer pending' 
    });
  }

  const { error } = await supabase
    .from('JobApplications')
    .delete()
    .eq('ApplicationID', applicationId)
    .eq('FreelancerID', userId);

  if (error) return res.status(500).json({ error: error.message });
  
  res.json({ success: true, message: 'Application deleted successfully' });
});

module.exports = router;
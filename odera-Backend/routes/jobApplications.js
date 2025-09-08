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

/* Application Rejected from the client side */
// Employer rejects an application
router.delete('/employerreject/:applicationId', authMiddleware, async (req, res) => {
  const employerId = req.user.id; // logged in employer
  const { applicationId } = req.params;

  // First, fetch the application with the related job to ensure employer owns the job
  const { data: existingApp, error: checkError } = await supabase
    .from('JobApplications')
    .select(`
      ApplicationID,
      Status,
      JobID,
      Jobs!inner(EmployerID)
    `)
    .eq('ApplicationID', applicationId)
    .single();

  if (checkError || !existingApp) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Ensure the employer owns this job
  if (existingApp.Jobs.EmployerID !== employerId) {
    return res.status(403).json({ error: 'Not authorized to reject this application' });
  }

  // Only allow rejection if still pending
  if (existingApp.Status !== 'Pending') {
    return res.status(400).json({ 
      error: 'Cannot reject application that is no longer pending' 
    });
  }

  // Instead of deleting, you might just want to update Status to 'Rejected'
  const { error } = await supabase
    .from('JobApplications')
    .update({ Status: 'Rejected' })
    .eq('ApplicationID', applicationId);

  if (error) return res.status(500).json({ error: error.message });
  
  res.json({ success: true, message: 'Application rejected successfully' });
});


/* User Recinds job application */
router.delete('clientreject/:applicationId', authMiddleware, async (req, res) => {
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
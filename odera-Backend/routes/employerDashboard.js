// employerDashboard.js
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');
const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Employer basic + profile info
    // Looks in the Employers table for the logged-in employer
    const { data: employerData, error: empErr } = await supabase
      .from('Employers')
      .select('EmployerID, CompanyName, EmployerProfiles(*)')
      .eq('EmployerID', userId)
      .single();

    if (empErr) throw empErr;

    const profile = employerData.EmployerProfiles?.[0] || {};

    // 2. Jobs created by this employer
    // Pulls jobs posted by this employer from the Jobs table.
    const { data: jobs, error: jobsErr } = await supabase
      .from('Jobs')
      .select('JobID, JobTitle, BudgetMin, BudgetMax, Duration, JobCreated, FreelancerID')
      .eq('EmployerID', employerData.EmployerID)
      .order('JobCreated', { ascending: false });

    if (jobsErr) {
      console.error('Error fetching jobs:', jobsErr);
      throw jobsErr;
    }

    // Calculate actual counts from jobs
    const totalJobs = (jobs || []).length;
    const openJobs = (jobs || []).filter(j => !j.FreelancerID).length;
    const assignedJobs = (jobs || []).filter(j => j.FreelancerID).length;

    const userData = {
      companyName: employerData.CompanyName,
      totalProjects: totalJobs,
      activeProjects: openJobs,
      completedProjects: assignedJobs,
      totalSpent: profile.TotalSpent || 0,
      avgProjectCost: profile.AvgProjectCost || 0,
      successRate: profile.SuccessRate || 0
    };

    // Get application counts for each job
    const jobIds = (jobs || []).map(j => j.JobID);
    let applicationCounts = {};

    if (jobIds.length > 0) {
      const { data: appCounts, error: appCountErr } = await supabase
        .from('JobApplications')
        .select('JobID')
        .in('JobID', jobIds);

      if (!appCountErr && appCounts) {
        // Count applications per job
        appCounts.forEach(app => {
          applicationCounts[app.JobID] = (applicationCounts[app.JobID] || 0) + 1;
        });
      }
    }

    const activeProjects = (jobs || []).map(j => {
      const applicationCount = applicationCounts[j.JobID] || 0;
      // Determine status based on whether a freelancer is assigned
      const status = j.FreelancerID ? 'Assigned' : 'Open';
      return {
        id: j.JobID,
        title: j.JobTitle || 'Untitled Job',
        developer: j.FreelancerID ? 'Hired' : 'No hire yet',
        developerAvatar: j.FreelancerID ? '✓' : '📋',
        budget: j.BudgetMax || j.BudgetMin || 0,
        spent: 0, // No spending until hired
        progress: 0, // No progress until hired
        deadline: j.Duration || 'Not specified',
        status: status,
        lastUpdate: dayjs(j.JobCreated).fromNow(),
        milestones: { completed: 0, total: applicationCount },
        skills: [] // Could join JobSkills table if needed
      };
    });

    // 3. Recent applications
    // Gets all applications for the jobs this employer posted.
    let applications = [];
    if (jobs && jobs.length > 0) {
      const { data: appsData, error: appsErr } = await supabase
        .from('JobApplications')
        .select(`
          ApplicationID, JobID, ProposalText, Experience, Timeline, Rating, CoverLetter,
          Jobs(JobTitle),
          Freelancers(FirstName, LastName, FreelancerProfile(Rating, CompletedProjects, HourlyRate, Specialty)),
          FreelancerSkills(Skill)
        `)
        .in('JobID', jobs.map(j => j.JobID));

      if (appsErr) throw appsErr;
      applications = appsData || [];
    }

  const recentApplications = applications.map(a => ({
    id: a.ApplicationID,
    projectTitle: a.Jobs?.JobTitle || '',
    applicant: `${a.Freelancers?.FirstName || ''} ${a.Freelancers?.LastName || ''}`.trim(),
    applicantAvatar: (a.Freelancers?.FirstName?.[0] || '') + (a.Freelancers?.LastName?.[0] || ''),
    rating: a.Freelancers?.FreelancerProfile?.Rating || 0,
    experience: a.Experience || 'Unknown',
    proposedBudget: a.Rating || 0,
    timeline: a.Timeline || '',
    coverLetter: a.CoverLetter || '',
    portfolio: (a.FreelancerSkills || []).map(s => s.Skill),
    appliedTime: 'N/A' // Would require an application timestamp column
  }));


    // 4. Messages (Revised with your specific schema constraint names)
    const { data: messagesData, error: msgErr } = await supabase
      .from('Messages')
      .select(`
        messageid, 
        content, 
        timestamp, 
        isunread, 
        type,
        project:Jobs(JobTitle),
        sender_employer:Employers!Messages_senderid_fkey1(FirstName, LastName),
        sender_freelancer:Freelancers!Messages_senderid_fkey2(FirstName, LastName)
      `)
      .eq('receiverid', userId)
      .order('timestamp', { ascending: false });

    if (msgErr) throw msgErr;

    const messages = (messagesData || []).map(m => {
      // Use whichever join returned data (one will be null)
      const sender = m.sender_freelancer || m.sender_employer;
      const firstName = sender?.FirstName || 'Unknown';
      const lastName = sender?.LastName || 'User';

      return {
        id: m.messageid,
        from: `${firstName} ${lastName}`,
        fromAvatar: firstName[0] + (lastName[0] || ''),
        project: m.project?.JobTitle || 'General Inquiry',
        message: m.content,
        time: dayjs(m.timestamp).fromNow(),
        unread: m.isunread,
        type: m.type
      };
    });

    // 5. Available developers
    // Pulls all freelancer profiles where availability is not 'Unavailable'
    const { data: devs, error: devErr } = await supabase
      .from('FreelancerProfile')
      .select(`
        FreelancerID, Organization, Availability, Rating, CompletedProjects, HourlyRate, Specialty, LastActive, ResponseTime, SuccessRate, Year, School,
        Freelancers(FirstName, LastName),
        FreelancerSkills(Skill)
      `)
      .neq('Availability', 'Unavailable');

    if (devErr) throw devErr;

    const availableDevelopers = devs.map(d => ({
      id: d.FreelancerID,
      name: `${d.Freelancers?.FirstName || ''} ${d.Freelancers?.LastName || ''}`.trim(),
      avatar: (d.Freelancers?.FirstName?.[0] || '') + (d.Freelancers?.LastName?.[0] || ''),
      school: d.School || '',
      year: d.Year || '',
      rating: d.Rating || 0,
      completedProjects: d.CompletedProjects || 0,
      hourlyRate: d.HourlyRate || 0,
      skills: (d.FreelancerSkills || []).map(s => s.Skill),
      specialty: d.Specialty || '',
      availability: d.Availability || '',
      lastActive: dayjs(d.LastActive).fromNow(),
      responseTime: d.ResponseTime || '',
      successRate: d.SuccessRate || 0
    }));

    // Send Response
    res.json({
      userData,
      activeProjects,
      messages: [],
      recentApplications,
      availableDevelopers
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a message as read
router.patch('/read/:messageid', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('Messages')
      .update({ isunread: false })
      .eq('messageid', req.params.messageid)
      .eq('receiverid', req.user.id); 

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

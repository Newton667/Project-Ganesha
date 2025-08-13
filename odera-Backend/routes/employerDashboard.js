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

    const userData = {
      companyName: employerData.CompanyName,
      totalProjects: profile.TotalProjects || 0,
      activeProjects: profile.ActiveProjects || 0,
      completedProjects: profile.CompletedProjects || 0,
      totalSpent: profile.TotalSpent || 0,
      avgProjectCost: profile.AvgProjectCost || 0,
      successRate: profile.SuccessRate || 0
    };

    // 2. Active projects
    // Pulls contracts for this employer from the Contracts table.
    const { data: contracts, error: contractErr } = await supabase
      .from('Contracts')
      .select(`
        ContractID, JobID, Progress, BudgetSpent, PricingMax, Status, LastUpdate,
        Jobs(JobTitle, Duration),
        Freelancers(FirstName, LastName),
        ProjectMilestones(IsComplete)
      `)
      .eq('EmployerID', employerData.EmployerID);

    if (contractErr) throw contractErr;

    const activeProjects = contracts.map(c => {
      const milestones = c.ProjectMilestones || [];
      const completed = milestones.filter(m => m.IsComplete).length;
      return {
        id: c.ContractID,
        title: c.Jobs?.JobTitle || 'Untitled Project',
        developer: `${c.Freelancers?.FirstName || ''} ${c.Freelancers?.LastName || ''}`.trim(),
        developerAvatar: (c.Freelancers?.FirstName?.[0] || '') + (c.Freelancers?.LastName?.[0] || ''),
        budget: c.PricingMax || 0,
        spent: c.BudgetSpent || 0,
        progress: c.Progress || 0,
        deadline: c.Jobs?.Duration || 'Unknown',
        status: c.Status,
        lastUpdate: dayjs(c.LastUpdate).fromNow(),
        milestones: { completed, total: milestones.length },
        skills: [] // Could join JobSkills table if needed
      };
    });

    // 3. Recent applications
    // Gets all applications for the jobs this employer owns.
    const { data: applications, error: appsErr } = await supabase
      .from('JobApplications')
      .select(`
        ApplicationID, JobID, ProposalText, Experience, Timeline, Rating, CoverLetter,
        Jobs(JobTitle),
        Freelancers(FirstName, LastName, FreelancerProfile(Rating, CompletedProjects, HourlyRate, Specialty)),
        FreelancerSkills(Skill)
      `)
      .in('JobID', contracts.map(c => c.JobID));

    if (appsErr) throw appsErr;

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

    // 4. Messages
    /*
    const { data: messagesData, error: msgErr } = await supabase
      .from('Messages')
      .select(`
        messageid, senderid, projectid, content, timestamp, isunread, type,
        sender:auth.users(full_name)
      `)
      .eq('receiverid', userId);

    if (msgErr) throw msgErr;

    const messages = messagesData.map(m => ({
      id: m.messageid,
      from: m.sender?.full_name || 'Unknown',
      fromAvatar: (m.sender?.full_name?.split(' ')[0]?.[0] || '') + (m.sender?.full_name?.split(' ')[1]?.[0] || ''),
      project: '', // Need join to Jobs or Contracts for name
      message: m.content,
      time: dayjs(m.timestamp).fromNow(),
      unread: m.isunread,
      type: m.type
    }));
    */

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

module.exports = router;

// routes/project.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../config/authMiddleware');

/**
 * Helper: fetch contract and verify requester is EmployerID or FreelancerID.
 * Returns { contract } on success or sends an error response and returns null.
 */
async function getContractForUser(contractId, userId, res) {
  const { data: contract, error } = await supabase
    .from('Contracts')
    .select('ContractID, JobID, EmployerID, FreelancerID, Status, Progress, PricingMin, PricingMax, StartDate, EndDate, BudgetSpent')
    .eq('ContractID', contractId)
    .maybeSingle();

  if (error) {
    console.error('[project] contract lookup error:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
    return null;
  }

  if (!contract) {
    res.status(404).json({ error: 'Contract not found' });
    return null;
  }

  if (contract.EmployerID !== userId && contract.FreelancerID !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return null;
  }

  return contract;
}

/**
 * GET /api/project/:contractId
 * Get full project details
 */
router.get('/:contractId', authMiddleware, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;

    const contract = await getContractForUser(contractId, userId, res);
    if (!contract) return;

    // Fetch job
    const { data: job, error: jobErr } = await supabase
      .from('Jobs')
      .select('JobTitle, JobDesc, BudgetMin, BudgetMax, Duration')
      .eq('JobID', contract.JobID)
      .maybeSingle();

    if (jobErr) {
      console.error('[GET /project/:contractId] job fetch error:', jobErr);
      return res.status(500).json({ error: 'Failed to fetch job details' });
    }

    // Fetch employer
    const { data: employer, error: empErr } = await supabase
      .from('Employers')
      .select('EmployerID, CompanyName')
      .eq('EmployerID', contract.EmployerID)
      .maybeSingle();

    if (empErr) {
      console.error('[GET /project/:contractId] employer fetch error:', empErr);
      return res.status(500).json({ error: 'Failed to fetch employer details' });
    }

    // Fetch freelancer
    const { data: freelancer, error: freErr } = await supabase
      .from('Freelancers')
      .select('FreelancerID, FirstName, LastName')
      .eq('FreelancerID', contract.FreelancerID)
      .maybeSingle();

    if (freErr) {
      console.error('[GET /project/:contractId] freelancer fetch error:', freErr);
      return res.status(500).json({ error: 'Failed to fetch freelancer details' });
    }

    // Fetch milestones
    const { data: milestones, error: milErr } = await supabase
      .from('ProjectMilestones')
      .select('MilestoneID, Title, Description, IsComplete')
      .eq('ContractID', contractId)
      .order('MilestoneID', { ascending: true });

    if (milErr) {
      console.error('[GET /project/:contractId] milestones fetch error:', milErr);
      return res.status(500).json({ error: 'Failed to fetch milestones' });
    }

    res.json({
      contract: {
        id: contract.ContractID,
        status: contract.Status,
        progress: contract.Progress,
        pricingMin: contract.PricingMin,
        pricingMax: contract.PricingMax,
        startDate: contract.StartDate,
        endDate: contract.EndDate,
        budgetSpent: contract.BudgetSpent,
      },
      job: job ? {
        title: job.JobTitle,
        desc: job.JobDesc,
        budgetMin: job.BudgetMin,
        budgetMax: job.BudgetMax,
        duration: job.Duration,
      } : null,
      employer: employer ? {
        id: employer.EmployerID,
        name: employer.CompanyName,
      } : null,
      freelancer: freelancer ? {
        id: freelancer.FreelancerID,
        firstName: freelancer.FirstName,
        lastName: freelancer.LastName,
      } : null,
      milestones: (milestones || []).map(m => ({
        id: m.MilestoneID,
        title: m.Title,
        description: m.Description,
        isComplete: m.IsComplete,
      })),
    });

  } catch (e) {
    console.error('[GET /project/:contractId] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

/**
 * GET /api/project/:contractId/messages
 * Get messages for this project and mark received messages as read
 */
router.get('/:contractId/messages', authMiddleware, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;

    const contract = await getContractForUser(contractId, userId, res);
    if (!contract) return;

    // Fetch messages ordered by timestamp ascending
    const { data: messages, error: msgErr } = await supabase
      .from('Messages')
      .select('messageid, senderid, receiverid, content, timestamp, isunread')
      .eq('projectid', contractId)
      .order('timestamp', { ascending: true });

    if (msgErr) {
      console.error('[GET /project/:contractId/messages] fetch error:', msgErr);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Mark messages where receiverid === userId as read
    const unreadIds = (messages || [])
      .filter(m => m.receiverid === userId && m.isunread)
      .map(m => m.messageid);

    if (unreadIds.length > 0) {
      const { error: updateErr } = await supabase
        .from('Messages')
        .update({ isunread: false })
        .in('messageid', unreadIds);

      if (updateErr) {
        console.error('[GET /project/:contractId/messages] mark-read error:', updateErr);
        // Non-fatal — continue
      }
    }

    const normalized = (messages || []).map(m => ({
      id: m.messageid,
      senderId: m.senderid,
      content: m.content,
      timestamp: m.timestamp,
      isunread: m.isunread,
      isMine: m.senderid === userId,
    }));

    res.json({ messages: normalized });

  } catch (e) {
    console.error('[GET /project/:contractId/messages] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

/**
 * POST /api/project/:contractId/messages
 * Send a message on this project
 */
router.post('/:contractId/messages', authMiddleware, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const contract = await getContractForUser(contractId, userId, res);
    if (!contract) return;

    // Determine receiver: if sender is employer, receiver is freelancer; vice versa
    const receiverId = contract.EmployerID === userId
      ? contract.FreelancerID
      : contract.EmployerID;

    const { data: newMessage, error: insertErr } = await supabase
      .from('Messages')
      .insert({
        senderid: userId,
        receiverid: receiverId,
        projectid: contractId,
        content: String(content).trim(),
        type: 'message',
        isunread: true,
      })
      .select('messageid, senderid, receiverid, content, timestamp, isunread')
      .single();

    if (insertErr) {
      console.error('[POST /project/:contractId/messages] insert error:', insertErr);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    res.status(201).json({
      message: {
        id: newMessage.messageid,
        senderId: newMessage.senderid,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        isunread: newMessage.isunread,
        isMine: true,
      },
    });

  } catch (e) {
    console.error('[POST /project/:contractId/messages] unhandled:', e);
    res.status(500).json({ error: 'Unhandled server error' });
  }
});

module.exports = router;

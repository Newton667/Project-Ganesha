// config/messages.js
// Shared inbox helper used by both employerDashboard.js and freelancerDashboard.js
const supabase = require('./supabaseClient');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

/**
 * getInboxForUser(userId)
 *
 * Fetches all Messages received by userId, enriched with sender name/avatar
 * and project title, ordered by timestamp descending.
 *
 * Note: Messages.senderid/receiverid are FKs to auth.users(id), not to
 * Employers/Freelancers directly, so PostgREST cannot join them. We look up
 * senders manually via two queries (Freelancers, Employers) and merge into
 * a sendersMap — this is deliberate, not a simplification target.
 *
 * Returns [{ id, from, fromAvatar, project, content, timestamp, unread, type, timeAgo }]
 */
async function getInboxForUser(userId) {
  const { data: messagesData, error: msgErr } = await supabase
    .from('Messages')
    .select(`
      messageid,
      senderid,
      content,
      timestamp,
      isunread,
      type,
      project:Jobs(JobTitle)
    `)
    .eq('receiverid', userId)
    .order('timestamp', { ascending: false });

  if (msgErr) throw msgErr;

  // Fetch sender details manually since we dropped the direct FKs
  const senderIds = [...new Set((messagesData || []).map(m => m.senderid))];
  let sendersMap = {};

  if (senderIds.length > 0) {
    const { data: freelancers } = await supabase.from('Freelancers').select('FreelancerID, FirstName, LastName').in('FreelancerID', senderIds);
    const { data: employers } = await supabase.from('Employers').select('EmployerID, FirstName, LastName').in('EmployerID', senderIds);

    (freelancers || []).forEach(f => { sendersMap[f.FreelancerID] = f; });
    (employers || []).forEach(e => { sendersMap[e.EmployerID] = e; });
  }

  return (messagesData || []).map(m => {
    const sender = sendersMap[m.senderid] || {};
    const firstName = sender?.FirstName || 'Unknown';
    const lastName = sender?.LastName || 'User';

    return {
      id: m.messageid,
      from: `${firstName} ${lastName}`.trim(),
      fromAvatar: firstName[0] + (lastName[0] || ''),
      project: m.project?.JobTitle || 'General Inquiry',
      content: m.content,
      timestamp: m.timestamp,
      unread: m.isunread,
      type: m.type,
      timeAgo: dayjs(m.timestamp).fromNow()
    };
  });
}

module.exports = { getInboxForUser };

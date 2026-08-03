import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import './ProjectView.css';

function ProjectView() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { session } = UserAuth();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const [sending, setSending] = useState(false);

  const chatContainerRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Fetch project details
  const fetchProject = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;

    try {
      const res = await fetch(`/api/project/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (!res.ok) {
        const err = text ? JSON.parse(text) : {};
        throw new Error(err.error || `Error ${res.status}`);
      }
      setProject(JSON.parse(text));
      setProjectError(null);
    } catch (err) {
      console.error('[ProjectView] fetchProject error:', err);
      setProjectError(err.message || 'Failed to load project');
    } finally {
      setLoadingProject(false);
    }
  }, [contractId, session]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;

    try {
      const res = await fetch(`/api/project/${contractId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (!res.ok) return;
      const data = JSON.parse(text);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('[ProjectView] fetchMessages error:', err);
    }
  }, [contractId, session]);

  // Initial load
  useEffect(() => {
    if (!session?.access_token) return;
    fetchProject();
    fetchMessages();
  }, [fetchProject, fetchMessages, session]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!session?.access_token) return;
    pollingRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollingRef.current);
  }, [fetchMessages, session]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || sending) return;

    const token = session?.access_token;
    if (!token) return;

    // Optimistic append
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      senderId: session.user?.id,
      content,
      timestamp: new Date().toISOString(),
      isunread: false,
      isMine: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setMessageInput('');
    setSending(true);

    try {
      const res = await fetch(`/api/project/${contractId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const text = await res.text();
      if (!res.ok) {
        // Revert optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        const err = text ? JSON.parse(text) : {};
        console.error('[ProjectView] send error:', err.error);
        return;
      }
      const data = JSON.parse(text);
      // Replace optimistic with real message
      setMessages(prev =>
        prev.map(m => (m.id === optimistic.id ? data.message : m))
      );
    } catch (err) {
      console.error('[ProjectView] send unhandled:', err);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  if (!session?.access_token) {
    return (
      <div className="project-view">
        <div className="pv-loading">Please log in to view this project.</div>
      </div>
    );
  }

  if (loadingProject) {
    return (
      <div className="project-view">
        <div className="pv-loading">Loading project...</div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="project-view">
        <div className="pv-error">
          <h3>Unable to load project</h3>
          <p>{projectError}</p>
          <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const { contract, job, employer, freelancer, milestones } = project || {};

  return (
    <div className="project-view">
      {/* Header Bar */}
      <div className="pv-header">
        <button className="pv-back-btn" onClick={() => navigate(-1)}>
          &#8592; Back
        </button>
        <div className="pv-header-title">
          <h1>{job?.title || 'Project'}</h1>
        </div>
        <span className={`status-badge ${getStatusClass(contract?.status)}`}>
          {contract?.status || 'Unknown'}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="pv-layout">

        {/* Left Panel */}
        <div className="pv-left">

          {/* Project Details Card */}
          <div className="pv-card">
            <h2 className="pv-card-title">Project Details</h2>

            <div className="pv-detail-row">
              <span className="pv-detail-label">Status</span>
              <span className={`status-badge ${getStatusClass(contract?.status)}`}>
                {contract?.status || '—'}
              </span>
            </div>

            <div className="pv-detail-row">
              <span className="pv-detail-label">Progress</span>
              <span className="pv-detail-value">{contract?.progress ?? 0}%</span>
            </div>
            <div className="pv-progress-bar">
              <div
                className="pv-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, contract?.progress ?? 0))}%` }}
              />
            </div>

            <div className="pv-detail-row">
              <span className="pv-detail-label">Budget Range</span>
              <span className="pv-detail-value">
                ${contract?.pricingMin ?? job?.budgetMin ?? '—'} – ${contract?.pricingMax ?? job?.budgetMax ?? '—'}
              </span>
            </div>

            <div className="pv-detail-row">
              <span className="pv-detail-label">Budget Spent</span>
              <span className="pv-detail-value">${contract?.budgetSpent ?? 0}</span>
            </div>

            {job?.duration && (
              <div className="pv-detail-row">
                <span className="pv-detail-label">Duration</span>
                <span className="pv-detail-value">{job.duration}</span>
              </div>
            )}

            <div className="pv-detail-row">
              <span className="pv-detail-label">Start Date</span>
              <span className="pv-detail-value">{formatDate(contract?.startDate)}</span>
            </div>

            <div className="pv-detail-row">
              <span className="pv-detail-label">End Date</span>
              <span className="pv-detail-value">{formatDate(contract?.endDate)}</span>
            </div>

            {job?.desc && (
              <div className="pv-description">
                <span className="pv-detail-label">Description</span>
                <p>{job.desc}</p>
              </div>
            )}
          </div>

          {/* Milestones Card */}
          <div className="pv-card">
            <h2 className="pv-card-title">Milestones</h2>
            {(!milestones || milestones.length === 0) ? (
              <p className="pv-empty-text">No milestones defined yet.</p>
            ) : (
              <ul className="milestone-list">
                {milestones.map(m => (
                  <li key={m.id} className={`milestone-item${m.isComplete ? ' milestone-complete' : ''}`}>
                    <span className="milestone-icon">
                      {m.isComplete ? '✓' : '○'}
                    </span>
                    <div className="milestone-body">
                      <span className="milestone-title">{m.title}</span>
                      {m.description && (
                        <span className="milestone-desc">{m.description}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Parties Card */}
          <div className="pv-card">
            <h2 className="pv-card-title">Both Parties</h2>
            <div className="pv-party">
              <span className="pv-party-role">Employer</span>
              <span className="pv-party-name">{employer?.name || '—'}</span>
            </div>
            <div className="pv-party">
              <span className="pv-party-role">Freelancer</span>
              <span className="pv-party-name">
                {freelancer
                  ? `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim() || '—'
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel — Chat */}
        <div className="pv-right">
          <div className="pv-card pv-chat-card">
            <div className="chat-header">
              <h2 className="pv-card-title">Project Messages</h2>
            </div>

            <div className="chat-messages" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="chat-empty">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`msg-wrapper${msg.isMine ? ' msg-wrapper-mine' : ' msg-wrapper-theirs'}`}
                  >
                    <div className={`msg-bubble${msg.isMine ? ' msg-mine' : ' msg-theirs'}`}>
                      <div className="msg-content">{msg.content}</div>
                      <div className="msg-meta">
                        <span className="msg-sender">
                          {msg.isMine
                            ? 'You'
                            : (employer && msg.senderId === employer.id
                                ? employer.name
                                : freelancer
                                  ? `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim()
                                  : 'Them')}
                        </span>
                        <span className="msg-time">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="chat-input-area">
              <textarea
                className="chat-textarea"
                placeholder="Type a message... (Ctrl+Enter to send)"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
              />
              <button
                className="btn-primary chat-send-btn"
                onClick={handleSend}
                disabled={!messageInput.trim() || sending}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProjectView;

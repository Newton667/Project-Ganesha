import React, { useState, useEffect, useMemo } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Employers.css';

const SAFE_DEFAULTS = {
  companyName: 'Your Company',
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalSpent: 0,
  avgProjectCost: 0,
  successRate: 0,
};

function Employers() {
  const [activeSection, setActiveSection] = useState('overview');
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'accept'|'reject', applicationId }
  
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(SAFE_DEFAULTS);
  const [activeProjects, setActiveProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [projectFilter, setProjectFilter] = useState('All');
  const [applicationProjectFilter, setApplicationProjectFilter] = useState('All Projects');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('All Statuses');
  const [developerSkillFilter, setDeveloperSkillFilter] = useState('All Skills');
  const [developerRateFilter, setDeveloperRateFilter] = useState('All Rates');

  // Load data when session becomes available
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Wait for auth; don't flag an error just because it's not ready yet
      const token = session?.access_token;
      if (!token) {
        setLoading(true);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/employerDashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Read as text first so we can show helpful errors if not JSON
        const text = await res.text();
        let data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            // Not JSON
          }
        }
        if (!res.ok) {
          throw new Error(data.error || `API ${res.status} ${res.statusText} — ${text || '(no body)'}`);
        }

        if (cancelled) return;

        console.log('📊 Employer Dashboard Data:', data);
        console.log('📋 Active Projects Count:', data.activeProjects?.length);
        console.log('📋 Active Projects:', data.activeProjects);
        setUserData(data.userData ?? SAFE_DEFAULTS);
        setActiveProjects(data.activeProjects ?? []);
        setMessages(data.messages ?? []);
        setRecentApplications(data.recentApplications ?? []);
        setAvailableDevelopers(data.availableDevelopers ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error('[Employers] fetch error:', err);
        setError(err.message || 'Unknown error');
        // Keep UI usable with defaults
        setUserData(SAFE_DEFAULTS);
        setActiveProjects([]);
        setMessages([]);
        setRecentApplications([]);
        setAvailableDevelopers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [session]);

  // Fetch active chats specific to the messages tab
  useEffect(() => {
    let cancelled = false;
    const fetchChats = async () => {
      if (!session?.access_token || !activeProjects.length) return;
      setLoadingChats(true);
      const chatsWithMessages = [];
      for (const project of activeProjects) {
        const contractId = project.contractId || project.id;
        if (!contractId) continue;
        try {
          const res = await fetch(`/api/project/${contractId}/messages`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              chatsWithMessages.push({
                project,
                messages: data.messages
              });
            }
          }
        } catch (err) {
          console.error('Failed to fetch messages for project', project.id);
        }
      }
      if (!cancelled) {
        setChats(chatsWithMessages);
        setLoadingChats(false);
      }
    };

    if (activeSection === 'messages') {
      fetchChats();
    }
    return () => { cancelled = true; };
  }, [activeSection, activeProjects, session]);

  const initials = useMemo(() => {
    const [first, last] = (userData?.companyName || 'Your Company').split(' ');
    return `${(first?.[0] || 'Y').toUpperCase()}${(last?.[0] || 'C').toUpperCase()}`;
  }, [userData]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`/api/employerDashboard/read/${messageId}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) throw new Error('Failed to update message status');

      // Optimistic UI Update: update the local state immediately
      setMessages(prevMessages =>
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, unread: false } : msg
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const handleRejectApplication = (applicationId) => {
    setConfirmAction({ type: 'reject', applicationId });
  };

  const handleAcceptApplication = (applicationId) => {
    setConfirmAction({ type: 'accept', applicationId });
  };

  const handleConfirm = async () => {
    const { type, applicationId } = confirmAction;
    setConfirmAction(null);

    try {
      if (type === 'reject') {
        const res = await fetch(`/api/job-applications/employerreject/${applicationId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to reject application');
        setRecentApplications(prev => prev.filter(app => app.id !== applicationId));
      } else {
        const res = await fetch(`/api/job-applications/employeraccept/${applicationId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to accept application');
        setRecentApplications(prev => prev.filter(app => app.id !== applicationId));
      }
    } catch (err) {
      console.error('Error processing application:', err.message);
      alert(`Error: ${err.message}`);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat.project);
    setChatMessages(chat.messages);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const contractId = selectedChat.contractId || selectedChat.id;
    try {
      const res = await fetch(`/api/project/${contractId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, data.message]);
        setNewMessage('');
        setChats(prevChats => prevChats.map(c => 
          (c.project.id === selectedChat.id) 
            ? { ...c, messages: [...c.messages, data.message] }
            : c
        ));
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleViewProject = (project) => {
    if (project.contractId) {
      navigate(`/project/${project.contractId}`);
    } else {
      alert('No contract exists for this job yet. A contract is created when you accept an application.');
    }
  };

  // Post New Project handler
  const handlePostProject = () => {
    navigate('/create-projects');
  };

  const filteredProjects = useMemo(() => {
    return activeProjects.filter(project => {
      if (projectFilter === 'All') return true;
      const status = (project.status || '').toLowerCase();
      if (projectFilter === 'Active') {
        return status.includes('assigned') || status.includes('active') || status.includes('progress');
      }
      if (projectFilter === 'Completed') {
        return status.includes('complete');
      }
      if (projectFilter === 'Pending') {
        return status.includes('open') || status.includes('pending');
      }
      return true;
    });
  }, [activeProjects, projectFilter]);

  const applicationProjects = useMemo(() => {
    const projects = recentApplications.map(app => app.projectTitle).filter(Boolean);
    return ['All Projects', ...new Set(projects)];
  }, [recentApplications]);

  const filteredApplications = useMemo(() => {
    return recentApplications.filter(app => {
      if (applicationProjectFilter !== 'All Projects' && app.projectTitle !== applicationProjectFilter) {
        return false;
      }
      if (applicationStatusFilter !== 'All Statuses') {
        const status = app.status || 'Pending Review';
        if (status.toLowerCase() !== applicationStatusFilter.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [recentApplications, applicationProjectFilter, applicationStatusFilter]);

  const developerSkills = useMemo(() => {
    const skills = new Set();
    availableDevelopers.forEach(dev => {
      (dev.skills || []).forEach(s => skills.add(s));
    });
    return ['All Skills', ...Array.from(skills).sort()];
  }, [availableDevelopers]);

  const filteredDevelopers = useMemo(() => {
    return availableDevelopers.filter(dev => {
      if (developerSkillFilter !== 'All Skills') {
        if (!(dev.skills || []).includes(developerSkillFilter)) return false;
      }
      if (developerRateFilter !== 'All Rates') {
        const rate = parseInt(String(dev.hourlyRate || '0').replace(/[^0-9]/g, ''), 10);
        if (developerRateFilter === 'Under $25/hr' && rate >= 25) return false;
        if (developerRateFilter === '$25-$35/hr' && (rate < 25 || rate > 35)) return false;
        if (developerRateFilter === '$35+/hr' && rate <= 35) return false;
      }
      return true;
    });
  }, [availableDevelopers, developerSkillFilter, developerRateFilter]);

  const renderOverview = () => (
    <div className="overview-content">
      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card total-projects">
          <div className="stat-header">
            <h3>Total Projects</h3>
            <span className="stat-icon">📋</span>
          </div>
          <div className="stat-value">{userData?.totalProjects ?? 0}</div>
          <div className="stat-change">{userData?.activeProjects ?? 0} active</div>
        </div>
        <div className="stat-card total-spent">
          <div className="stat-header">
            <h3>Total Invested</h3>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value">
            ${Number(userData?.totalSpent ?? 0).toLocaleString()}
          </div>
          <div className="stat-change">Avg: ${userData?.avgProjectCost ?? 0}</div>
        </div>
        <div className="stat-card success-rate">
          <div className="stat-header">
            <h3>Success Rate</h3>
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-value">{userData?.successRate ?? 0}%</div>
          <div className="stat-change">{userData?.completedProjects ?? 0} completed</div>
        </div>
        <div className="stat-card avg-delivery">
          <div className="stat-header">
            <h3>Avg. Delivery</h3>
            <span className="stat-icon">⚡</span>
          </div>
          <div className="stat-value">2.1 weeks</div>
          <div className="stat-change">On-time delivery</div>
        </div>
      </div>
      
      {/* Active Projects Overview */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Active Projects</h2>
          <button className="btn-primary" onClick={handlePostProject}>Post New Project</button>
        </div>
        <div className="projects-overview">
          {activeProjects.length === 0 ? (
            <div className="empty-state-projects">
              <p>No active projects yet. Start by posting a new project!</p>
            </div>
          ) : (
            activeProjects.map(project => (
              <div key={project.id} className="project-overview-card">
                <div className="project-overview-header">
                  <h3>{project.title}</h3>
                  <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                    {project.status}
                  </span>
                </div>
                <div className="project-overview-meta">
                  <div className="developer-info">
                    <div className="developer-avatar">{project.developerAvatar}</div>
                    <span>{project.developer}</span>
                  </div>
                  <div className="budget-info">
                    <span className="spent">${project.spent}</span>
                    <span className="total">/ ${project.budget}</span>
                  </div>
                </div>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>{project.progress}% Complete</span>
                    <span>{project.milestones.completed}/{project.milestones.total} Milestones</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
                <div className="project-overview-actions">
                  <button className="btn-secondary" onClick={() => handleViewProject(project)}>View Details</button>
                  <button className="btn-link">Message Developer</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-item primary" onClick={handlePostProject}>
            <span className="action-icon">➕</span>
            <span>Post New Project</span>
          </button>
          <button className="action-item" onClick={() => setActiveSection('developers')}>
            <span className="action-icon">👥</span>
            <span>Browse Developers</span>
          </button>
          <button className="action-item">
            <span className="action-icon">📊</span>
            <span>View Analytics</span>
          </button>
          <button className="action-item" onClick={() => setActiveSection('messages')}>
            <span className="action-icon">💬</span>
            <span>Messages</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="projects-content">
      <div className="section-header">
        <h2>My Projects</h2>
        <div className="project-actions">
          <div className="project-filters">
            <button className={`filter-btn ${projectFilter === 'All' ? 'active' : ''}`} onClick={() => setProjectFilter('All')}>All</button>
            <button className={`filter-btn ${projectFilter === 'Active' ? 'active' : ''}`} onClick={() => setProjectFilter('Active')}>Active</button>
            <button className={`filter-btn ${projectFilter === 'Completed' ? 'active' : ''}`} onClick={() => setProjectFilter('Completed')}>Completed</button>
            <button className={`filter-btn ${projectFilter === 'Pending' ? 'active' : ''}`} onClick={() => setProjectFilter('Pending')}>Pending</button>
          </div>
          <button className="btn-primary" onClick={handlePostProject}>Post New Project</button>
        </div>
      </div>
      <div className="projects-grid">
        {activeProjects.length === 0 && projectFilter === 'All' ? (
          <div className="empty-state-projects">
            <p>No projects found. Create your first project to get started!</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state-projects">
            <p>No projects found matching the selected filter.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card detailed">
            <div className="project-header">
              <h3>{project.title || 'Untitled Project'}</h3>
              <span className={`status-badge ${String(project.status || '').toLowerCase().replace(' ', '-')}`}>
                {project.status || 'Unknown'}
              </span>
            </div>
            <div className="developer-section">
              <div className="developer-info">
                <div className="developer-avatar">{project.developerAvatar || 'D'}</div>
                <div className="developer-details">
                  <span className="developer-name">{project.developer || '—'}</span>
                  <span className="developer-meta">Last update: {project.lastUpdate || '—'}</span>
                </div>
              </div>
              <button className="contact-developer-btn">Contact</button>
            </div>
            <div className="project-financials">
              <div className="financial-item">
                <span className="label">Budget</span>
                <span className="value">${project.budget ?? 0}</span>
              </div>
              <div className="financial-item">
                <span className="label">Spent</span>
                <span className="value spent">${project.spent ?? 0}</span>
              </div>
              <div className="financial-item">
                <span className="label">Remaining</span>
                <span className="value">${(project.budget ?? 0) - (project.spent ?? 0)}</span>
              </div>
            </div>
            <div className="progress-section">
              <div className="progress-header">
                <span>Progress: {project.progress ?? 0}%</span>
                <span>Due: {project.deadline || '—'}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${project.progress ?? 0}%` }}></div>
              </div>
            </div>
            <div className="skills-section">
              {(project.skills || []).map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            <div className="project-actions">
              <button className="btn-secondary" onClick={() => handleViewProject(project)}>View Details</button>
              <button className="btn-primary" onClick={() => handleViewProject(project)}>Review Progress</button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="applications-content">
      <div className="section-header">
        <h2>Recent Applications</h2>
        <div className="application-filters">
          <select 
            className="filter-select"
            value={applicationProjectFilter}
            onChange={(e) => setApplicationProjectFilter(e.target.value)}
          >
            {applicationProjects.map(proj => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={applicationStatusFilter}
            onChange={(e) => setApplicationStatusFilter(e.target.value)}
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Accepted">Accepted</option>
          </select>
        </div>
      </div>
      <div className="applications-list">
        {recentApplications.length === 0 && applicationProjectFilter === 'All Projects' && applicationStatusFilter === 'All Statuses' ? (
          <div className="application-card">
            <p>No applications yet. Your project applications will appear here.</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="application-card">
            <p>No applications found matching the selected filters.</p>
          </div>
        ) : (
          filteredApplications.map(application => (
          <div key={application.id} className="application-card">
            <div className="application-header">
              <div className="applicant-info">
                <div className="applicant-avatar">{application.applicantAvatar || 'A'}</div>
                <div className="applicant-details">
                  <h3>{application.applicant || 'Anonymous'}</h3>
                  <div className="applicant-meta">
                    <span className="rating">⭐ {application.rating ?? 0}</span>
                    <span className="experience">{application.experience || '—'} experience</span>
                    <span className="applied-time">Applied {application.appliedTime || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="application-proposal">
                <div className="proposal-item">
                  <span className="label">Budget</span>
                  <span className="value">${application.proposedBudget ?? 0}</span>
                </div>
                <div className="proposal-item">
                  <span className="label">Timeline</span>
                  <span className="value">{application.timeline || '—'}</span>
                </div>
              </div>
            </div>
            <div className="project-title">
              <strong>Project:</strong> {application.projectTitle || 'Untitled Project'}
            </div>
            <div className="cover-letter">
              <h4>Cover Letter</h4>
              <p>{application.coverLetter || 'No cover letter provided'}</p>
            </div>
            <div className="portfolio-skills">
              <h4>Skills</h4>
              <div className="skills-list">
                {(application.portfolio || []).map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            <div className="application-actions">
              <button className="btn-secondary">View Profile</button>
              <button className="btn-secondary">Message</button>
              <button
              className="btn-reject"
              onClick={() => handleRejectApplication(application.id)}>
              Reject Application
              </button>

              <button
                className="btn-primary"
                onClick={() => handleAcceptApplication(application.id)}
              >
                Accept Application
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="messages-content" style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
      <div className="chats-sidebar" style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h2>Chats</h2>
        </div>
        <div className="messages-list" style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
          {loadingChats ? (
            <div className="message-item"><p>Loading active chats...</p></div>
          ) : chats.length === 0 ? (
            <div className="message-item"><p>No active chats with messages.</p></div>
          ) : (
            chats.map(chat => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              const isSelected = selectedChat?.id === chat.project.id;
              return (
                <div 
                  key={chat.project.id} 
                  className={`message-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                  style={{ 
                    cursor: 'pointer', 
                    borderLeft: isSelected ? '4px solid #007bff' : 'none',
                    opacity: isSelected ? 1 : 0.8
                  }}
                >
                  <div className="message-header">
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{chat.project.title || 'Untitled Project'}</h3>
                  </div>
                  <p className="message-preview" style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                    {lastMsg?.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="chat-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
        {selectedChat ? (
          <>
            <div className="chat-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: 0 }}>{selectedChat.title || 'Untitled Project'}</h3>
            </div>
            <div className="chat-messages" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  style={{
                    alignSelf: msg.isMine ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.isMine ? '#007bff' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '12px 18px',
                    borderRadius: '20px',
                    borderBottomRightRadius: msg.isMine ? '5px' : '20px',
                    borderBottomLeftRadius: msg.isMine ? '20px' : '5px',
                    maxWidth: '75%'
                  }}
                >
                  <p style={{ margin: 0, lineHeight: '1.4' }}>{msg.content}</p>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '8px', textAlign: msg.isMine ? 'right' : 'left' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '20px', gap: '10px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type a message..." 
                style={{ 
                  flex: 1, 
                  padding: '12px 20px', 
                  borderRadius: '25px', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={!newMessage.trim()}
                style={{ borderRadius: '25px', padding: '0 25px' }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
            <p>Select a chat from the left to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDevelopers = () => (
    <div className="developers-content">
      <div className="section-header">
        <h2>Available Developers</h2>
        <div className="developer-filters">
          <select 
            className="filter-select"
            value={developerSkillFilter}
            onChange={(e) => setDeveloperSkillFilter(e.target.value)}
          >
            {developerSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={developerRateFilter}
            onChange={(e) => setDeveloperRateFilter(e.target.value)}
          >
            <option value="All Rates">All Rates</option>
            <option value="Under $25/hr">Under $25/hr</option>
            <option value="$25-$35/hr">$25-$35/hr</option>
            <option value="$35+/hr">$35+/hr</option>
          </select>
        </div>
      </div>
      <div className="developers-grid">
        {availableDevelopers.length === 0 && developerSkillFilter === 'All Skills' && developerRateFilter === 'All Rates' ? (
          <div className="developer-card">
            <p>No developers available at the moment. Check back later!</p>
          </div>
        ) : filteredDevelopers.length === 0 ? (
          <div className="developer-card">
            <p>No developers found matching the selected filters.</p>
          </div>
        ) : (
          filteredDevelopers.map(developer => (
          <div key={developer.id} className="developer-card">
            <div className="developer-header">
              <div className="developer-avatar">{developer.avatar || 'D'}</div>
              <div className="developer-info">
                <h3>{developer.name || 'Anonymous Developer'}</h3>
                <p className="school">{developer.school || '—'} - {developer.year || '—'}</p>
                <p className="specialty">{developer.specialty || 'General Development'}</p>
              </div>
              <div className="availability-status">
                <span className={`availability ${(developer.availability || '').includes('Now') ? 'available' : 'busy'}`}>
                  {developer.availability || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="developer-stats">
              <div className="stat">
                <span className="stat-value">⭐ {developer.rating ?? 0}</span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat">
                <span className="stat-value">{developer.completedProjects ?? 0}</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat">
                <span className="stat-value">${developer.hourlyRate ?? 0}/hr</span>
                <span className="stat-label">Rate</span>
              </div>
              <div className="stat">
                <span className="stat-value">{developer.successRate ?? 0}%</span>
                <span className="stat-label">Success</span>
              </div>
            </div>
            <div className="developer-skills">
              {(developer.skills || []).map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            <div className="developer-meta">
              <span>Response time: {developer.responseTime || '—'}</span>
              <span>Last active: {developer.lastActive || '—'}</span>
            </div>
            <div className="developer-actions">
              <button className="btn-secondary">View Profile</button>
              <button className="btn-primary">Invite to Project</button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'overview': return renderOverview();
      case 'projects': return renderProjects();
      case 'applications': return renderApplications();
      case 'messages': return renderMessages();
      case 'developers': return renderDevelopers();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="employer-dashboard">
        <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employer-dashboard">
        <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>
          <h3>Error loading dashboard</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const unreadMessages = messages.filter(msg => msg.unread).length;
  const pendingApplications = recentApplications.length;

  return (
    <div className="employer-dashboard">
      <div className="navbar-area"></div>
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="company-info">
          <div className="company-avatar">{initials}</div>
          <div className="company-details">
            <h1>Welcome back, {userData?.companyName ?? 'Your Company'}</h1>
            <p>
              {userData?.activeProjects ?? 0} active projects • {userData?.successRate ?? 0}% success rate
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-count">5</span>
          </button>
          <button className="profile-btn" onClick={() => navigate("/dashboard/employers/settings")}>
            Settings
          </button>
          <button className="profile-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          <span className="nav-icon">📊</span>
          Overview
        </button>
        <button 
          className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveSection('projects')}
        >
          <span className="nav-icon">📋</span>
          My Projects
          <span className="nav-badge">{userData?.activeProjects ?? 0}</span>
        </button>
        <button 
          className={`nav-item ${activeSection === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveSection('applications')}
        >
          <span className="nav-icon">📝</span>
          Applications
          {pendingApplications > 0 && <span className="nav-badge">{pendingApplications}</span>}
        </button>
        <button 
          className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveSection('messages')}
        >
          <span className="nav-icon">💬</span>
          Messages
          {unreadMessages > 0 && <span className="nav-badge">{unreadMessages}</span>}
        </button>
        <button 
          className={`nav-item ${activeSection === 'developers' ? 'active' : ''}`}
          onClick={() => setActiveSection('developers')}
        >
          <span className="nav-icon">👥</span>
          Find Developers
        </button>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-content">
        {renderContent()}
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className={`confirm-modal-icon ${confirmAction.type}`}>
              {confirmAction.type === 'accept' ? '✓' : '✕'}
            </div>
            <h2>{confirmAction.type === 'accept' ? 'Accept Application' : 'Reject Application'}</h2>
            <p>
              {confirmAction.type === 'accept'
                ? 'A contract will be created and the job will be assigned to this freelancer.'
                : 'Are you sure you want to reject this application? This cannot be undone.'}
            </p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button
                className={confirmAction.type === 'accept' ? 'btn-primary' : 'btn-reject'}
                onClick={handleConfirm}
              >
                {confirmAction.type === 'accept' ? 'Accept' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employers;
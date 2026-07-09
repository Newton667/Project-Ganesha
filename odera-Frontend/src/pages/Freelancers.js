import React, { useState, useEffect, useMemo } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Freelancers.css';

const SAFE_DEFAULTS = {
  name: 'User',
  profileCompletion: 0,
  totalEarnings: 0,
  activeProjects: 0,
  completedProjects: 0,
  rating: 0,
  responseTime: '—',
  availability: '—',
};

function Freelancers() {
  const [activeSection, setActiveSection] = useState('overview');

  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(SAFE_DEFAULTS);
  const [activeProjects, setActiveProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [projectFilter, setProjectFilter] = useState('All');
  const [opportunityCategoryFilter, setOpportunityCategoryFilter] = useState('All Categories');
  const [opportunityBudgetFilter, setOpportunityBudgetFilter] = useState('All Budgets');

  // Fetch account type
  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      setAccountType(null);
      return;
    }
    async function fetchAccountType() {
      try {
        const resp = await fetch('/api/account-info', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setAccountType(data.accountType);
        }
      } catch (e) {
        console.error('Failed to fetch account type:', e);
      }
    }
    fetchAccountType();
  }, [session]);

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

        const res = await fetch('/api/freelancerDashboard', {
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

        setUserData(data.userData ?? SAFE_DEFAULTS);
        setActiveProjects(data.activeProjects ?? []);
        setMessages(data.messages ?? []);
        setOpportunities(data.opportunities ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error('[Freelancers] fetch error:', err);
        setError(err.message || 'Unknown error');
        // Keep UI usable with defaults
        setUserData(SAFE_DEFAULTS);
        setActiveProjects([]);
        setMessages([]);
        setOpportunities([]);
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
    const [first, last] = (userData?.name || 'User').split(' ');
    return `${(first?.[0] || 'U').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;
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

  const handlePostJob = () => {
    if (!session) {
      navigate('/login');
      return;
    }

    // Check if user has a freelancer account
    if (accountType === 'Freelancer') {
      setShowWarning(true);
      return;
    }

    // For Employer, Both, or Unknown accounts, proceed normally
    navigate('/create-projects');
  };

  const handleProceedAnyway = () => {
    setShowWarning(false);
    navigate('/create-projects');
  };

  const handleCancelPost = () => {
    setShowWarning(false);
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

  const handleNotificationClick = (e) => {
    e.stopPropagation();
    setShowNotifications(prev => !prev);
  };

  const handleMarkMessageRead = (messageId) => {
    // This is a mock-up. In a real app, you'd send a request to the backend.
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, unread: false } : msg
    ));
  };

  const unreadMessages = useMemo(() => messages.filter(msg => msg.unread), [messages]);
  const notificationCount = unreadMessages.length;

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

  const opportunityCategories = useMemo(() => {
    const categories = new Set();
    opportunities.forEach(opp => {
      (opp.skills || []).forEach(skill => categories.add(skill));
    });
    return ['All Categories', ...Array.from(categories).sort()];
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      if (opportunityCategoryFilter !== 'All Categories') {
        if (!(opp.skills || []).includes(opportunityCategoryFilter)) {
          return false;
        }
      }
      if (opportunityBudgetFilter !== 'All Budgets') {
        const budgetVal = parseInt(String(opp.budget || '0').replace(/[^0-9]/g, ''), 10);
        if (opportunityBudgetFilter === 'Under $500' && budgetVal >= 500) return false;
        if (opportunityBudgetFilter === '$500-$1000' && (budgetVal < 500 || budgetVal > 1000)) return false;
        if (opportunityBudgetFilter === '$1000+' && budgetVal <= 1000) return false;
      }
      return true;
    });
  }, [opportunities, opportunityCategoryFilter, opportunityBudgetFilter]);

  const renderOverview = () => (
    <div className="overview-content">
      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card earnings">
          <div className="stat-header">
            <h3>Total Earnings</h3>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value">
            ${Number(userData?.totalEarnings ?? 0).toLocaleString()}
          </div>
          <div className="stat-change">+15% this month</div>
        </div>
        <div className="stat-card projects">
          <div className="stat-header">
            <h3>Active Projects</h3>
            <span className="stat-icon">📋</span>
          </div>
          <div className="stat-value">{userData?.activeProjects ?? 0}</div>
          <div className="stat-change">{userData?.completedProjects ?? 0} completed</div>
        </div>
        <div className="stat-card rating">
          <div className="stat-header">
            <h3>Rating</h3>
            <span className="stat-icon">⭐</span>
          </div>
          <div className="stat-value">{userData?.rating ?? 0}</div>
          <div className="stat-change">Based on recent reviews</div>
        </div>
        <div className="stat-card response">
          <div className="stat-header">
            <h3>Response Time</h3>
            <span className="stat-icon">⚡</span>
          </div>
          <div className="stat-value">{userData?.responseTime ?? '—'}</div>
          <div className="stat-change">Average response</div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Active Projects</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="projects-list">
          {activeProjects.length === 0 && (
            <div className="project-card">
              <p>No active projects yet. Check out the opportunities section to find new work!</p>
            </div>
          )}
          {activeProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.title}</h3>
                <span className={`status-badge ${String(project.status || '').toLowerCase().replace(' ', '-')}`}>
                  {project.status || 'Unknown'}
                </span>
              </div>
              <div className="project-details">
                <p><strong>Client:</strong> {project.client || '—'}</p>
                <p><strong>Budget:</strong> ${project.budget ?? '—'}</p>
                <p><strong>Deadline:</strong> {project.deadline || '—'}</p>
              </div>
              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress: {project.progress ?? 0}%</span>
                  <span>Milestone {project?.milestones?.completed ?? 0}/{project?.milestones?.total ?? 0}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress ?? 0}%` }} />
                </div>
              </div>
              <div className="project-actions">
                <button className="btn-secondary" onClick={() => navigate(`/project/${project.id}`)}>View Details</button>
                <button className="btn-primary">Update Progress</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-item" onClick={() => setActiveSection('profile')}>
            <span className="action-icon">👤</span>
            <span>Update Profile</span>
          </button>
          <button className="action-item" onClick={() => setActiveSection('opportunities')}>
            <span className="action-icon">💼</span>
            <span>Browse Projects</span>
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
        <div className="project-filters">
          <button className={`filter-btn ${projectFilter === 'All' ? 'active' : ''}`} onClick={() => setProjectFilter('All')}>All</button>
          <button className={`filter-btn ${projectFilter === 'Active' ? 'active' : ''}`} onClick={() => setProjectFilter('Active')}>Active</button>
          <button className={`filter-btn ${projectFilter === 'Completed' ? 'active' : ''}`} onClick={() => setProjectFilter('Completed')}>Completed</button>
          <button className={`filter-btn ${projectFilter === 'Pending' ? 'active' : ''}`} onClick={() => setProjectFilter('Pending')}>Pending</button>
        </div>
      </div>
      <div className="projects-grid">
        {activeProjects.length === 0 && projectFilter === 'All' ? (
          <div className="project-card">
            <p>No projects found. Start browsing opportunities to find your first project!</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="project-card">
            <p>No projects found matching the selected filter.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
          <div key={project.id} className="project-card detailed">
            <div className="project-header">
              <h3>{project.title}</h3>
              <span className={`status-badge ${String(project.status || '').toLowerCase().replace(' ', '-')}`}>
                {project.status || 'Unknown'}
              </span>
            </div>
            <div className="project-meta">
              <div className="meta-item">
                <span className="meta-label">Client</span>
                <span className="meta-value">{project.client || '—'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Budget</span>
                <span className="meta-value">${project.budget ?? '—'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Deadline</span>
                <span className="meta-value">{project.deadline || '—'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Progress</span>
                <span className="meta-value">{project.progress ?? 0}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${project.progress ?? 0}%` }} />
            </div>
            <div className="project-actions">
              <button className="btn-secondary">Message Client</button>
              <button className="btn-primary" onClick={() => navigate(`/project/${project.id}`)}>Open Project</button>
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

  const renderOpportunities = () => (
    <div className="opportunities-content">
      <div className="section-header">
        <h2>Available Opportunities</h2>
        <div className="opportunity-filters">
          <select 
            className="filter-select"
            value={opportunityCategoryFilter}
            onChange={(e) => setOpportunityCategoryFilter(e.target.value)}
          >
            {opportunityCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={opportunityBudgetFilter}
            onChange={(e) => setOpportunityBudgetFilter(e.target.value)}
          >
            <option value="All Budgets">All Budgets</option>
            <option value="Under $500">Under $500</option>
            <option value="$500-$1000">$500-$1000</option>
            <option value="$1000+">$1000+</option>
          </select>
        </div>
      </div>
      <div className="opportunities-list">
        {opportunities.length === 0 && opportunityCategoryFilter === 'All Categories' && opportunityBudgetFilter === 'All Budgets' ? (
          <div className="opportunity-item">
            <p>No opportunities available at the moment. Check back later for new projects!</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="opportunity-item">
            <p>No opportunities found matching the selected filters.</p>
          </div>
        ) : (
          filteredOpportunities.map(opportunity => (
          <div key={opportunity.id} className={`opportunity-item urgency-${opportunity.urgency || 'low'}`}>
            <div className="opportunity-header">
              <h3>{opportunity.title || 'Untitled Project'}</h3>
              <span className="budget">{opportunity.budget || 'Budget TBD'}</span>
            </div>
            <div className="opportunity-meta">
              <span className="client">by {opportunity.client || 'Anonymous Client'}</span>
              <span className="duration">{opportunity.duration || 'Duration TBD'}</span>
              <span className="posted">{opportunity.posted || 'Recently posted'}</span>
            </div>
            <div className="skills-required">
              {(opportunity.skills || []).map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            <div className="opportunity-footer">
              <span className="proposals">{opportunity.proposals ?? 0} proposals</span>
              <div className="opportunity-actions">
                <button className="btn-secondary">Save</button>
                <button className="btn-primary">Apply Now</button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'projects': return renderProjects();
      case 'messages': return renderMessages();
      case 'opportunities': return renderOpportunities();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="freelancer-dashboard">
        <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="freelancer-dashboard">
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

  return (
    <div className="freelancer-dashboard">
      <div className="navbar-area"></div>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div className="user-details">
            <h1>Welcome back, {userData?.name ?? 'User'}</h1>
            <p>Profile {userData?.profileCompletion ?? 0}% complete • {userData?.availability ?? '—'}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="post-job-btn" onClick={handlePostJob}>
            <span className="plus-icon">+</span>
            Post New Job
          </button>
          <div className="notification-wrapper">
            <button className="notification-btn" onClick={handleNotificationClick}>
              <span className="notification-icon">🔔</span>
              {notificationCount > 0 && <span className="notification-count">{notificationCount}</span>}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                </div>
                <div className="notification-list">
                  {notificationCount > 0 ? (
                    unreadMessages.map(msg => (
                      <div key={msg.id} className="notification-item" onClick={() => handleMarkMessageRead(msg.id)}>
                        <p><strong>New Message:</strong> {msg.content}</p>
                        <span className="notification-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="notification-item">
                      <p>No new notifications.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="profile-btn" onClick={() => navigate("/dashboard/freelancers/settings")}>
            Settings
          </button>
          <button className="profile-btn" onClick={handleSignOut}>Sign Out</button>
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
          className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveSection('messages')}
        >
          <span className="nav-icon">💬</span>
          Messages
          {notificationCount > 0 && <span className="nav-badge">{notificationCount}</span>}
        </button>
        <button
          className={`nav-item ${activeSection === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveSection('opportunities')}
        >
          <span className="nav-icon">🔍</span>
          Opportunities
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {renderContent()}
      </div>

      {/* Warning Modal for Freelancer Accounts */}
      {showWarning && (
        <div className="warning-modal-overlay" onClick={handleCancelPost}>
          <div className="warning-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="warning-modal-header">
              <div className="warning-icon">⚠️</div>
              <h2>Freelancer Account Warning</h2>
            </div>
            <div className="warning-modal-body">
              <p>
                You are about to post a job using a <strong>Freelancer account</strong>.
              </p>
              <p>
                For posting jobs, we recommend using an <strong>Employer account</strong> as it provides better features and credibility for job postings.
              </p>
              <p className="warning-note">
                Note: The backend may restrict job posting to employer accounts only.
              </p>
            </div>
            <div className="warning-modal-footer">
              <button className="btn-cancel" onClick={handleCancelPost}>
                Cancel
              </button>
              <button className="btn-proceed" onClick={handleProceedAnyway}>
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Freelancers;
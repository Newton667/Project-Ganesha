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
  const [earningsData, setEarningsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
        if (!res.ok) {
          throw new Error(`API ${res.status} ${res.statusText} — ${text || '(no body)'}`);
        }

        const data = text ? JSON.parse(text) : {};
        if (cancelled) return;

        setUserData(data.userData ?? SAFE_DEFAULTS);
        setActiveProjects(data.activeProjects ?? []);
        setMessages(data.messages ?? []);
        setOpportunities(data.opportunities ?? []);
        setEarningsData(data.earningsData ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error('[Freelancers] fetch error:', err);
        setError(err.message || 'Unknown error');
        // Keep UI usable with defaults
        setUserData(SAFE_DEFAULTS);
        setActiveProjects([]);
        setMessages([]);
        setOpportunities([]);
        setEarningsData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [session]);

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
                <button className="btn-secondary">View Details</button>
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
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Active</button>
          <button className="filter-btn">Completed</button>
          <button className="filter-btn">Pending</button>
        </div>
      </div>
      <div className="projects-grid">
        {activeProjects.length === 0 && (
          <div className="project-card">
            <p>No projects found. Start browsing opportunities to find your first project!</p>
          </div>
        )}
        {activeProjects.map(project => (
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
              <button className="btn-primary">Open Project</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="messages-content">
      <div className="section-header">
        <h2>Messages</h2>
        <button className="btn-primary">Compose</button>
      </div>
      <div className="messages-list">
        {messages.length === 0 && (
          <div className="message-item">
            <p>No messages yet. Your client communications will appear here.</p>
          </div>
        )}
        {messages.map(message => (
          <div key={message.id} className={`message-item ${message.unread ? 'unread' : ''}`}>
            <div className="message-header">
              <h3>{message.client || 'Unknown Client'}</h3>
              <span className="message-time">{message.time || '—'}</span>
            </div>
            <p className="message-preview">{message.message || 'No message content'}</p>
            <div className="message-actions">
              <button className="btn-secondary">Reply</button>
              <button className="btn-link">Mark as Read</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOpportunities = () => (
    <div className="opportunities-content">
      <div className="section-header">
        <h2>Available Opportunities</h2>
        <div className="opportunity-filters">
          <select className="filter-select">
            <option>All Categories</option>
            <option>Web Development</option>
            <option>Mobile Apps</option>
            <option>Design</option>
          </select>
          <select className="filter-select">
            <option>All Budgets</option>
            <option>Under $500</option>
            <option>$500-$1000</option>
            <option>$1000+</option>
          </select>
        </div>
      </div>
      <div className="opportunities-list">
        {opportunities.length === 0 && (
          <div className="opportunity-item">
            <p>No opportunities available at the moment. Check back later for new projects!</p>
          </div>
        )}
        {opportunities.map(opportunity => (
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
        ))}
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

  const unreadMessages = messages.filter(msg => msg.unread).length;

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
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-count">3</span>
          </button>
          <button className="profile-btn">Settings</button>
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
          {unreadMessages > 0 && <span className="nav-badge">{unreadMessages}</span>}
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
    </div>
  );
}

export default Freelancers;
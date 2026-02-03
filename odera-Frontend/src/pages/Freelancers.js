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
  const [accountType, setAccountType] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

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
        // Keep UI usable
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
  }, [session]); // re-run when session changes

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
            <div className="project-card"><p>No active projects yet.</p></div>
          )}
          {activeProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.title}</h3>
                <span className={`status-badge ${String(project.status || '').toLowerCase().replace(' ', '-')}`}>
                  {project.status || '—'}
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
          <button className="action-item">
            <span className="action-icon">👤</span>
            <span>Update Profile</span>
          </button>
          <button className="action-item">
            <span className="action-icon">💼</span>
            <span>Browse Projects</span>
          </button>
          <button className="action-item">
            <span className="action-icon">📊</span>
            <span>View Analytics</span>
          </button>
          <button className="action-item">
            <span className="action-icon">💬</span>
            <span>Messages</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      default: return renderOverview();
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading dashboard...</div>;
  if (error)   return <div style={{ color: 'red',   padding: '2rem' }}>Error: {error}</div>;

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
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-count">3</span>
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
          <span className="nav-icon">📊</span> Overview
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

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
  const [selectedProject, setSelectedProject] = useState(null);
  
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(SAFE_DEFAULTS);
  const [activeProjects, setActiveProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);
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

        const res = await fetch('/api/employerDashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Read as text first so we can show helpful errors if not JSON
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`API ${res.status} ${res.statusText} — ${text || '(no body)'}`);
        }

        const data = text ? JSON.parse(text) : {};
        if (cancelled) return;

        console.log('📊 Employer Dashboard Data:', data);
        console.log('📋 Active Projects Count:', data.activeProjects?.length);
        console.log('📋 Active Projects:', data.activeProjects);
        setUserData(data.userData ?? SAFE_DEFAULTS);
        setActiveProjects(data.activeProjects ?? []);
        setMessages(data.messages ?? []);
        setRecentApplications(data.recentApplications ?? []);
        setAvailableDevelopers(data.availableDevelopers ?? []);
        setEarningsData(data.earningsData ?? []);
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
        setEarningsData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [session]);

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

  const handleRejectApplication = async (applicationId) => {
    if (!session?.access_token) {
      console.error("No session token found.");
      return;
    }
  
    try {
      const res = await fetch(`/api/job-applications/employerreject/${applicationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.error || "Failed to reject application");
      }
  
      // Remove the rejected application from local state
      setRecentApplications(prev =>
        prev.filter(app => app.id !== applicationId)
      );
  
      console.log("Application rejected:", result.message);
    } catch (err) {
      console.error("Error rejecting application:", err.message);
      alert(`Error: ${err.message}`);
    }
  };
  

        e.preventDefault()
        try {
            await signOut();
            navigate('/');
        } catch (err) {
            console.error(err)
        }
    }

  // Post New Project handler
  const handlePostProject = () => {
    navigate('/create-projects');
  };

  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>Loading dashboard...</div>;

  // Mock user data
  /*
  const userData = {
    companyName: 'TechStart Inc.',
    totalProjects: 18,
    activeProjects: 3,
    completedProjects: 15,
    totalSpent: 24500,
    avgProjectCost: 1360,
    successRate: 94
  };
  
  // Active projects
  const activeProjects = [
    {
      id: 1,
      title: 'E-commerce Platform Development',
      developer: 'Alex Chen',
      developerAvatar: 'AC',
      budget: 2500,
      spent: 1875,
      progress: 75,
      deadline: '2 weeks',
      status: 'In Progress',
      lastUpdate: '2 hours ago',
      milestones: { completed: 3, total: 4 },
      skills: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Mobile App UI Redesign',
      developer: 'Maria Garcia',
      developerAvatar: 'MG',
      budget: 1200,
      spent: 540,
      progress: 45,
      deadline: '3 weeks',
      status: 'In Progress',
      lastUpdate: '1 day ago',
      milestones: { completed: 2, total: 5 },
      skills: ['Figma', 'Mobile Design', 'Prototyping']
    },
    {
      id: 3,
      title: 'Data Analytics Dashboard',
      developer: 'James Wilson',
      developerAvatar: 'JW',
      budget: 1800,
      spent: 360,
      progress: 20,
      deadline: '4 weeks',
      status: 'Just Started',
      lastUpdate: '3 days ago',
      milestones: { completed: 1, total: 6 },
      skills: ['Python', 'Dashboard', 'Charts']
    }
  ];
  
  // Recent applications
  const recentApplications = [
    {
      id: 1,
      projectTitle: 'WordPress Plugin Development',
      applicant: 'Sarah Johnson',
      applicantAvatar: 'SJ',
      rating: 4.9,
      experience: '3 years',
      proposedBudget: 800,
      timeline: '2 weeks',
      coverLetter: 'I have extensive experience with WordPress plugin development and have created similar plugins for e-commerce sites...',
      portfolio: ['WordPress', 'PHP', 'JavaScript'],
      appliedTime: '2 hours ago'
    },
    {
      id: 2,
      projectTitle: 'React Component Library',
      applicant: 'David Kim',
      applicantAvatar: 'DK',
      rating: 4.7,
      experience: '2 years',
      proposedBudget: 1200,
      timeline: '3 weeks',
      coverLetter: 'I specialize in creating reusable React components and have built component libraries for multiple startups...',
      portfolio: ['React', 'TypeScript', 'Storybook'],
      appliedTime: '5 hours ago'
    },
    {
      id: 3,
      projectTitle: 'API Integration Service',
      applicant: 'Lisa Chen',
      applicantAvatar: 'LC',
      rating: 5.0,
      experience: '4 years',
      proposedBudget: 600,
      timeline: '1 week',
      coverLetter: 'I have experience integrating various APIs including payment gateways, social media APIs, and third-party services...',
      portfolio: ['Node.js', 'API Integration', 'Express'],
      appliedTime: '1 day ago'
    }
  ];
  
  // Messages
  const messages = [
    {
      id: 1,
      from: 'Alex Chen',
      fromAvatar: 'AC',
      project: 'E-commerce Platform',
      message: 'I\'ve completed the user authentication module. Ready for your review!',
      time: '30 minutes ago',
      unread: true,
      type: 'update'
    },
    {
      id: 2,
      from: 'Maria Garcia',
      fromAvatar: 'MG',
      project: 'Mobile App UI',
      message: 'Could you clarify the navigation requirements for the settings page?',
      time: '2 hours ago',
      unread: true,
      type: 'question'
    },
    {
      id: 3,
      from: 'James Wilson',
      fromAvatar: 'JW',
      project: 'Analytics Dashboard',
      message: 'Thank you for the feedback. I\'ll implement the changes today.',
      time: '1 day ago',
      unread: false,
      type: 'response'
    }
  ];
  
  // Available developers
  const availableDevelopers = [
    {
      id: 1,
      name: 'Emma Thompson',
      avatar: 'ET',
      school: 'Stanford University',
      year: 'Senior',
      rating: 4.9,
      completedProjects: 8,
      hourlyRate: 28,
      skills: ['React', 'Vue.js', 'Node.js', 'Python'],
      specialty: 'Full-Stack Development',
      availability: 'Available Now',
      lastActive: '2 hours ago',
      responseTime: '1 hour',
      successRate: 100
    },
    {
      id: 2,
      name: 'Ryan Martinez',
      avatar: 'RM',
      school: 'MIT',
      year: 'Graduate',
      rating: 4.8,
      completedProjects: 12,
      hourlyRate: 32,
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      specialty: 'Mobile Development',
      availability: 'Available in 1 week',
      lastActive: '5 hours ago',
      responseTime: '2 hours',
      successRate: 95
    },
    {
      id: 3,
      name: 'Sophie Chen',
      avatar: 'SC',
      school: 'UC Berkeley',
      year: 'Junior',
      rating: 4.7,
      completedProjects: 6,
      hourlyRate: 25,
      skills: ['UI Design', 'Figma', 'Prototyping', 'User Research'],
      specialty: 'UI/UX Design',
      availability: 'Available Now',
      lastActive: '1 hour ago',
      responseTime: '30 minutes',
      successRate: 98
    }
  ];
  */
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
                  <button className="btn-secondary">View Details</button>
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
            <button className="filter-btn active">All</button>
            <button className="filter-btn">Active</button>
            <button className="filter-btn">Completed</button>
            <button className="filter-btn">Pending</button>
          </div>
          <button className="btn-primary" onClick={handlePostProject}>Post New Project</button>
        </div>
      </div>
      <div className="projects-grid">
        {activeProjects.length === 0 ? (
          <div className="empty-state-projects">
            <p>No projects found. Create your first project to get started!</p>
          </div>
        ) : (
          activeProjects.map(project => (
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
              <button className="btn-secondary">View Details</button>
              <button className="btn-primary">Review Progress</button>
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
          <select className="filter-select">
            <option>All Projects</option>
          </select>
          <select className="filter-select">
            <option>All Statuses</option>
            <option>Pending Review</option>
            <option>Reviewed</option>
            <option>Accepted</option>
          </select>
        </div>
      </div>
      <div className="applications-list">
        {recentApplications.length === 0 && (
          <div className="application-card">
            <p>No applications yet. Your project applications will appear here.</p>
          </div>
        )}
        {recentApplications.map(application => (
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

              <button className="btn-primary">Accept Application</button>
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
        <button className="btn-primary">Compose Message</button>
      </div>
      <div className="messages-list">
        {messages.length === 0 && (
          <div className="message-item">
            <p>No messages yet. Your developer communications will appear here.</p>
          </div>
        )}
        {messages.map(message => (
          <div key={message.id} className={`message-item ${message.unread ? 'unread' : ''}`}>
            <div className="message-header">
              <div className="sender-info">
                <div className="sender-avatar">{message.fromAvatar || 'S'}</div>
                <div className="sender-details">
                  <h3>{message.from || 'Unknown Sender'}</h3>
                  <span className="project-ref">Re: {message.project || 'Unknown Project'}</span>
                </div>
              </div>
              <div className="message-meta">
                <span className={`message-type ${message.type || 'message'}`}>
                  {message.type || 'message'}
                </span>
                <span className="message-time">{message.time || '—'}</span>
              </div>
            </div>
            <p className="message-content">{message.message || 'No message content'}</p>
            <div className="message-actions">
              <button className="btn-secondary">Reply</button>
              <button className="btn-link">View Project</button>
              {message.unread && <button className="btn-link">Mark as Read</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDevelopers = () => (
    <div className="developers-content">
      <div className="section-header">
        <h2>Available Developers</h2>
        <div className="developer-filters">
          <select className="filter-select">
            <option>All Skills</option>
            <option>React</option>
            <option>Mobile Development</option>
            <option>UI/UX Design</option>
            <option>Python</option>
          </select>
          <select className="filter-select">
            <option>All Rates</option>
            <option>Under $25/hr</option>
            <option>$25-$35/hr</option>
            <option>$35+/hr</option>
          </select>
        </div>
      </div>
      <div className="developers-grid">
        {availableDevelopers.length === 0 && (
          <div className="developer-card">
            <p>No developers available at the moment. Check back later!</p>
          </div>
        )}
        {availableDevelopers.map(developer => (
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
        ))}
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
    </div>
  );
}

export default Employers;
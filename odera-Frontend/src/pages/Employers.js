import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Employers.css';

function Employers() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Define session
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [activeProjects, setActiveProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;

    fetch('/api/employerDashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then((data) => {
        console.log('📊 Employer Dashboard Data:', data);
        console.log('📋 Active Projects Count:', data.activeProjects?.length);
        console.log('📋 Active Projects:', data.activeProjects);
        setUserData(data.userData);
        setActiveProjects(data.activeProjects);
        setMessages(data.messages);
        setRecentApplications(data.recentApplications);
        setAvailableDevelopers(data.availableDevelopers);
        setEarningsData(data.earningsData);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [session]);

  // Signout Function, integrate into UI later
  const handleSignOut = async (e) => {
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
          <div className="stat-value">{userData.totalProjects}</div>
          <div className="stat-change">{userData.activeProjects} active</div>
        </div>
        <div className="stat-card total-spent">
          <div className="stat-header">
            <h3>Total Invested</h3>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value">${userData.totalSpent.toLocaleString()}</div>
          <div className="stat-change">Avg: ${userData.avgProjectCost}</div>
        </div>
        <div className="stat-card success-rate">
          <div className="stat-header">
            <h3>Success Rate</h3>
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-value">{userData.successRate}%</div>
          <div className="stat-change">{userData.completedProjects} completed</div>
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
          <button className="action-item">
            <span className="action-icon">👥</span>
            <span>Browse Developers</span>
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
              <h3>{project.title}</h3>
              <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            <div className="developer-section">
              <div className="developer-info">
                <div className="developer-avatar">{project.developerAvatar}</div>
                <div className="developer-details">
                  <span className="developer-name">{project.developer}</span>
                  <span className="developer-meta">Last update: {project.lastUpdate}</span>
                </div>
              </div>
              <button className="contact-developer-btn">Contact</button>
            </div>
            <div className="project-financials">
              <div className="financial-item">
                <span className="label">Budget</span>
                <span className="value">${project.budget}</span>
              </div>
              <div className="financial-item">
                <span className="label">Spent</span>
                <span className="value spent">${project.spent}</span>
              </div>
              <div className="financial-item">
                <span className="label">Remaining</span>
                <span className="value">${project.budget - project.spent}</span>
              </div>
            </div>
            <div className="progress-section">
              <div className="progress-header">
                <span>Progress: {project.progress}%</span>
                <span>Due: {project.deadline}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
            <div className="skills-section">
              {project.skills.map((skill, index) => (
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
            <option>WordPress Plugin</option>
            <option>React Component</option>
            <option>API Integration</option>
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
        {recentApplications.map(application => (
          <div key={application.id} className="application-card">
            <div className="application-header">
              <div className="applicant-info">
                <div className="applicant-avatar">{application.applicantAvatar}</div>
                <div className="applicant-details">
                  <h3>{application.applicant}</h3>
                  <div className="applicant-meta">
                    <span className="rating">⭐ {application.rating}</span>
                    <span className="experience">{application.experience} experience</span>
                    <span className="applied-time">Applied {application.appliedTime}</span>
                  </div>
                </div>
              </div>
              <div className="application-proposal">
                <div className="proposal-item">
                  <span className="label">Budget</span>
                  <span className="value">${application.proposedBudget}</span>
                </div>
                <div className="proposal-item">
                  <span className="label">Timeline</span>
                  <span className="value">{application.timeline}</span>
                </div>
              </div>
            </div>
            <div className="project-title">
              <strong>Project:</strong> {application.projectTitle}
            </div>
            <div className="cover-letter">
              <h4>Cover Letter</h4>
              <p>{application.coverLetter}</p>
            </div>
            <div className="portfolio-skills">
              <h4>Skills</h4>
              <div className="skills-list">
                {application.portfolio.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            <div className="application-actions">
              <button className="btn-secondary">View Profile</button>
              <button className="btn-secondary">Message</button>
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
        {messages.map(message => (
          <div key={message.id} className={`message-item ${message.unread ? 'unread' : ''}`}>
            <div className="message-header">
              <div className="sender-info">
                <div className="sender-avatar">{message.fromAvatar}</div>
                <div className="sender-details">
                  <h3>{message.from}</h3>
                  <span className="project-ref">Re: {message.project}</span>
                </div>
              </div>
              <div className="message-meta">
                <span className={`message-type ${message.type}`}>{message.type}</span>
                <span className="message-time">{message.time}</span>
              </div>
            </div>
            <p className="message-content">{message.message}</p>
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
        {availableDevelopers.map(developer => (
          <div key={developer.id} className="developer-card">
            <div className="developer-header">
              <div className="developer-avatar">{developer.avatar}</div>
              <div className="developer-info">
                <h3>{developer.name}</h3>
                <p className="school">{developer.school} - {developer.year}</p>
                <p className="specialty">{developer.specialty}</p>
              </div>
              <div className="availability-status">
                <span className={`availability ${developer.availability.includes('Now') ? 'available' : 'busy'}`}>
                  {developer.availability}
                </span>
              </div>
            </div>
            <div className="developer-stats">
              <div className="stat">
                <span className="stat-value">⭐ {developer.rating}</span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat">
                <span className="stat-value">{developer.completedProjects}</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat">
                <span className="stat-value">${developer.hourlyRate}/hr</span>
                <span className="stat-label">Rate</span>
              </div>
              <div className="stat">
                <span className="stat-value">{developer.successRate}%</span>
                <span className="stat-label">Success</span>
              </div>
            </div>
            <div className="developer-skills">
              {developer.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            <div className="developer-meta">
              <span>Response time: {developer.responseTime}</span>
              <span>Last active: {developer.lastActive}</span>
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

  return (
    <div className="employer-dashboard">
      <div className="navbar-area"></div>
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="company-info">
          <div className="company-avatar">TS</div>
          <div className="company-details">
            <h1>Welcome back, {userData.companyName}</h1>
            <p>{userData.activeProjects} active projects • {userData.successRate}% success rate</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-count">5</span>
          </button>
          <button className="profile-btn">Settings</button>
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
          <span className="nav-badge">{userData.activeProjects}</span>
        </button>
        <button 
          className={`nav-item ${activeSection === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveSection('applications')}
        >
          <span className="nav-icon">📝</span>
          Applications
          <span className="nav-badge">3</span>
        </button>
        <button 
          className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveSection('messages')}
        >
          <span className="nav-icon">💬</span>
          Messages
          <span className="nav-badge">2</span>
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
import React, { useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Freelancers.css';

function Freelancers() {
  const [activeSection, setActiveSection] = useState('overview');
  
  // Define session
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  // Mock user data
  const userData = {
    name: 'Alex Chen',
    profileCompletion: 85,
    totalEarnings: 4850,
    activeProjects: 2,
    completedProjects: 12,
    rating: 4.8,
    responseTime: '2 hours',
    availability: 'Available'
  };
  
  // Active projects
  const activeProjects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      client: 'TechStart Inc.',
      progress: 75,
      budget: 1500,
      deadline: '5 days',
      status: 'In Progress',
      lastUpdate: '2 hours ago',
      milestones: { completed: 3, total: 4 }
    },
    {
      id: 2,
      title: 'Mobile App UI Design',
      client: 'Design Studio',
      progress: 45,
      budget: 800,
      deadline: '2 weeks',
      status: 'In Progress',
      lastUpdate: '1 day ago',
      milestones: { completed: 2, total: 5 }
    }
  ];
  
  // Recent messages
  const messages = [
    {
      id: 1,
      client: 'TechStart Inc.',
      message: 'Great work on the homepage! Can we discuss the checkout flow?',
      time: '30 minutes ago',
      unread: true
    },
    {
      id: 2,
      client: 'Design Studio',
      message: 'Please send the updated wireframes when ready.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 3,
      client: 'Previous Client',
      message: 'Thank you for the excellent work!',
      time: '1 day ago',
      unread: false
    }
  ];
  
  // Available opportunities
  const opportunities = [
    {
      id: 1,
      title: 'React Dashboard Development',
      budget: '$1,200 - $2,000',
      duration: '3-4 weeks',
      skills: ['React', 'Node.js', 'Charts'],
      proposals: 8,
      posted: '2 hours ago',
      client: 'Analytics Co.',
      urgency: 'high'
    },
    {
      id: 2,
      title: 'WordPress Plugin Development',
      budget: '$600 - $900',
      duration: '2 weeks',
      skills: ['PHP', 'WordPress', 'JavaScript'],
      proposals: 5,
      posted: '5 hours ago',
      client: 'Marketing Agency',
      urgency: 'medium'
    },
    {
      id: 3,
      title: 'Data Visualization Script',
      budget: '$400 - $600',
      duration: '1 week',
      skills: ['Python', 'Matplotlib', 'Pandas'],
      proposals: 12,
      posted: '1 day ago',
      client: 'Research Lab',
      urgency: 'low'
    }
  ];
  
  // Earnings data (last 6 months)
  const earningsData = [
    { month: 'Jan', amount: 650 },
    { month: 'Feb', amount: 820 },
    { month: 'Mar', amount: 720 },
    { month: 'Apr', amount: 950 },
    { month: 'May', amount: 1100 },
    { month: 'Jun', amount: 1350 }
  ];

  const renderOverview = () => (
    <div className="overview-content">
      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card earnings">
          <div className="stat-header">
            <h3>Total Earnings</h3>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value">${userData.totalEarnings.toLocaleString()}</div>
          <div className="stat-change">+15% this month</div>
        </div>
        <div className="stat-card projects">
          <div className="stat-header">
            <h3>Active Projects</h3>
            <span className="stat-icon">📋</span>
          </div>
          <div className="stat-value">{userData.activeProjects}</div>
          <div className="stat-change">{userData.completedProjects} completed</div>
        </div>
        <div className="stat-card rating">
          <div className="stat-header">
            <h3>Rating</h3>
            <span className="stat-icon">⭐</span>
          </div>
          <div className="stat-value">{userData.rating}</div>
          <div className="stat-change">Based on 12 reviews</div>
        </div>
        <div className="stat-card response">
          <div className="stat-header">
            <h3>Response Time</h3>
            <span className="stat-icon">⚡</span>
          </div>
          <div className="stat-value">{userData.responseTime}</div>
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
          {activeProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.title}</h3>
                <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                  {project.status}
                </span>
              </div>
              <div className="project-details">
                <p><strong>Client:</strong> {project.client}</p>
                <p><strong>Budget:</strong> ${project.budget}</p>
                <p><strong>Deadline:</strong> {project.deadline}</p>
              </div>
              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress: {project.progress}%</span>
                  <span>Milestone {project.milestones.completed}/{project.milestones.total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
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
        {activeProjects.map(project => (
          <div key={project.id} className="project-card detailed">
            <div className="project-header">
              <h3>{project.title}</h3>
              <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            <div className="project-meta">
              <div className="meta-item">
                <span className="meta-label">Client</span>
                <span className="meta-value">{project.client}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Budget</span>
                <span className="meta-value">${project.budget}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Deadline</span>
                <span className="meta-value">{project.deadline}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Progress</span>
                <span className="meta-value">{project.progress}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
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
        {messages.map(message => (
          <div key={message.id} className={`message-item ${message.unread ? 'unread' : ''}`}>
            <div className="message-header">
              <h3>{message.client}</h3>
              <span className="message-time">{message.time}</span>
            </div>
            <p className="message-preview">{message.message}</p>
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
        {opportunities.map(opportunity => (
          <div key={opportunity.id} className={`opportunity-item urgency-${opportunity.urgency}`}>
            <div className="opportunity-header">
              <h3>{opportunity.title}</h3>
              <span className="budget">{opportunity.budget}</span>
            </div>
            <div className="opportunity-meta">
              <span className="client">by {opportunity.client}</span>
              <span className="duration">{opportunity.duration}</span>
              <span className="posted">{opportunity.posted}</span>
            </div>
            <div className="skills-required">
              {opportunity.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            <div className="opportunity-footer">
              <span className="proposals">{opportunity.proposals} proposals</span>
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
    switch(activeSection) {
      case 'overview': return renderOverview();
      case 'projects': return renderProjects();
      case 'messages': return renderMessages();
      case 'opportunities': return renderOpportunities();
      default: return renderOverview();
    }
  };

  return (
    <div className="freelancer-dashboard">
      <div className="navbar-area"></div>
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">AC</div>
          <div className="user-details">
            <h1>Welcome back, {userData.name}</h1>
            <p>Profile {userData.profileCompletion}% complete • {userData.availability}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-count">3</span>
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
          className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveSection('messages')}
        >
          <span className="nav-icon">💬</span>
          Messages
          <span className="nav-badge">2</span>
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
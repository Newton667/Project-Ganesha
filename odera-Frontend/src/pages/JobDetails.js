import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import './JobDetails.css';

const API_BASE = process.env.REACT_APP_API_BASE || '';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = UserAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Account info
  const [accountType, setAccountType] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  
  // Interest/Application state
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestForm, setInterestForm] = useState({
    proposalText: '',
    experience: '',
    timeline: '',
    coverLetter: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch job details
  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        setError('');
        
        const resp = await fetch(`${API_BASE}/api/jobs/${id}`);
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${resp.status}`);
        }
        
        const data = await resp.json();
        setJob(data);
      } catch (e) {
        setError(e.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchJob();
  }, [id]);

  // Fetch account type and check if already applied
  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      setAccountLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/account-info`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch account info')))
      .then((data) => {
        setAccountType(data.accountType);
        // Only check application status for freelancers
        if ((data.accountType === 'Freelancer' || data.accountType === 'Both') && id) {
          return fetch(`${API_BASE}/api/jobs/${id}/hasApplied`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.ok ? res.json() : null)
            .then(result => { if (result?.hasApplied) setSubmitSuccess(true); });
        }
      })
      .catch((err) => {
        console.error('Account info error:', err);
      })
      .finally(() => setAccountLoading(false));
  }, [session, id]);

  const handleInterestChange = (e) => {
    const { name, value } = e.target;
    setInterestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitInterest = async (e) => {
    e.preventDefault();
    
    if (!interestForm.proposalText.trim()) {
      setSubmitError('Please provide a proposal message');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Please log in to express interest');
      }

      const resp = await fetch(`${API_BASE}/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          proposalText: interestForm.proposalText.trim(),
          experience: interestForm.experience.trim(),
          timeline: interestForm.timeline.trim(),
          coverLetter: interestForm.coverLetter.trim()
        })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitSuccess(true);
      setShowInterestModal(false);
      
      // Reset form
      setInterestForm({
        proposalText: '',
        experience: '',
        timeline: '',
        coverLetter: ''
      });

    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const prettyBudget = (b) => {
    if (!b) return '—';
    const min = Number(b.min || 0).toFixed(0);
    const max = Number(b.max || 0).toFixed(0);
    if (!Number(max) && !Number(min)) return '—';
    if (min === max) return `$${max}`;
    return `$${min} - $${max}`;
  };

  const getUrgencyClass = (urgency) => {
    switch(urgency?.toLowerCase()) {
      case 'urgent': return 'urgency-badge urgency-urgent';
      case 'high': return 'urgency-badge urgency-high';
      case 'medium': return 'urgency-badge urgency-medium';
      case 'low': return 'urgency-badge urgency-low';
      default: return 'urgency-badge';
    }
  };

  const canExpressInterest = () => {
    // User must be logged in and be a freelancer (or both)
    return session && (accountType === 'Freelancer' || accountType === 'Both');
  };

  const isOwnJob = () => {
    // Check if the current user is the job poster
    return session?.user?.id === job?.employerId;
  };

  // Icons
  const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const DollarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CategoryIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H10V10H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 4H20V10H14V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 14H10V20H4V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 14H20V20H14V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="job-details-container">
        <div className="loading-state">Loading job details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-details-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button className="back-btn" onClick={() => navigate('/explore')}>
            <BackIcon /> Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-container">
        <div className="error-state">
          <p>Job not found</p>
          <button className="back-btn" onClick={() => navigate('/explore')}>
            <BackIcon /> Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-container">
      <div className="job-details-header">
        <button className="back-btn" onClick={() => navigate('/explore')}>
          <BackIcon /> Back to Jobs
        </button>
      </div>

      <div className="job-details-content">
        <div className="job-main">
          <div className="job-title-section">
            <h1 className="job-title">{job.title}</h1>
            <div className="job-meta-badges">
              {job.urgency && (
                <span className={getUrgencyClass(job.urgency)}>
                  {job.urgency}
                </span>
              )}
              {job.category && (
                <span className="category-badge">{job.category}</span>
              )}
            </div>
          </div>

          <div className="job-posted">
            Posted {job.posted || 'recently'}
          </div>

          {job.employerName && (
            <div className="employer-info-section">
              <div className="employer-avatar">
                {(job.employerName[0] || 'C').toUpperCase()}
              </div>
              <div className="employer-details">
                <span className="employer-label">Posted by</span>
                <span className="employer-name">{job.employerName}</span>
              </div>
            </div>
          )}

          <div className="job-description-section">
            <h2>Project Description</h2>
            <p className="job-description">{job.desc || 'No description provided.'}</p>
          </div>

          {submitSuccess && (
            <div className="success-message">
              ✓ Your interest has been submitted successfully! The employer will review your application.
            </div>
          )}
        </div>

        <div className="job-sidebar">
          <div className="job-info-card">
            <h3>Job Details</h3>
            
            <div className="info-row">
              <DollarIcon />
              <div className="info-content">
                <span className="info-label">Budget</span>
                <span className="info-value">{prettyBudget(job.budget)}</span>
              </div>
            </div>

            {job.duration && (
              <div className="info-row">
                <ClockIcon />
                <div className="info-content">
                  <span className="info-label">Duration</span>
                  <span className="info-value">{job.duration}</span>
                </div>
              </div>
            )}

            <div className="info-row">
              <CategoryIcon />
              <div className="info-content">
                <span className="info-label">Category</span>
                <span className="info-value">{job.category || '—'}</span>
              </div>
            </div>

            <div className="info-row">
              <CalendarIcon />
              <div className="info-content">
                <span className="info-label">Posted</span>
                <span className="info-value">{job.posted || '—'}</span>
              </div>
            </div>
          </div>

          <div className="action-section">
            {!session ? (
              <div className="login-prompt">
                <p>Log in to express interest in this job</p>
                <button 
                  className="login-btn"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </button>
              </div>
            ) : isOwnJob() ? (
              <div className="own-job-notice">
                <p>This is your job posting</p>
                <button 
                  className="manage-btn"
                  onClick={() => navigate('/dashboard/employers')}
                >
                  Manage Jobs
                </button>
              </div>
            ) : accountLoading ? (
              <div className="loading-action">Checking account...</div>
            ) : canExpressInterest() ? (
              <button 
                className="express-interest-btn"
                onClick={() => setShowInterestModal(true)}
                disabled={submitSuccess}
              >
                {submitSuccess ? '✓ Interest Submitted' : 'Express Interest'}
              </button>
            ) : (
              <div className="employer-notice">
                <p>Only freelancer accounts can apply to jobs</p>
                <button 
                  className="browse-btn"
                  onClick={() => navigate('/explore')}
                >
                  Browse More Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="modal-overlay" onClick={() => setShowInterestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Express Interest</h2>
              <button className="modal-close" onClick={() => setShowInterestModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmitInterest} className="interest-form">
              <div className="form-group">
                <label htmlFor="proposalText">Your Proposal *</label>
                <textarea
                  id="proposalText"
                  name="proposalText"
                  value={interestForm.proposalText}
                  onChange={handleInterestChange}
                  placeholder="Describe why you're a great fit for this project..."
                  rows={5}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Relevant Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={interestForm.experience}
                  onChange={handleInterestChange}
                  placeholder="Describe your relevant experience and skills..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeline">Estimated Timeline</label>
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  value={interestForm.timeline}
                  onChange={handleInterestChange}
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">Additional Notes</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={interestForm.coverLetter}
                  onChange={handleInterestChange}
                  placeholder="Any additional information you'd like to share..."
                  rows={3}
                />
              </div>

              {submitError && (
                <div className="form-error">{submitError}</div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowInterestModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetails;

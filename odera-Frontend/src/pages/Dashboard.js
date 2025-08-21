//Dasgboard.js
import React, { useEffect, useMemo, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const initialsFromName = (first = '', last = '') =>
  `${(first[0] || '').toUpperCase()}${(last[0] || '').toUpperCase()}` || 'U';

const Dashboard = () => {
  // Auth
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  // Backend data
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);

  const firstName = session?.user?.user_metadata?.firstName || '';
  const lastName  = session?.user?.user_metadata?.lastName  || '';
  const email     = session?.user?.email || '';
  const initials  = useMemo(() => initialsFromName(firstName, lastName), [firstName, lastName]);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    fetch('/api/employerDashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch dashboard data')))
      .then((data) => setJsonData(data))
      .catch((err) => setError(err.message || 'Unknown error'));
  }, [session]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  // CTA actions
    const goFreelancer = () => navigate('/dashboard/freelancers');
    const goEmployer   = () => navigate('/dashboard/employers');


  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="dashboard__bar">
        <div className="dashboard__brand">
          <div className="dashboard__logo">OD</div>
          <h1 className="dashboard__title">Dashboard</h1>
        </div>
        <button className="dashboard__signout" onClick={handleSignOut} aria-label="Sign out">
          Sign Out
        </button>
      </div>

      <div className="dashboard__grid">
        {/* Left: welcome + CTAs */}
        <div className="panel">
          <div className="welcome">
            <div className="avatar" aria-hidden>{initials}</div>
            <div className="usertext">
              <h1>Welcome, {firstName || 'User'} {lastName}</h1>
              <p>{email || 'No email on file'}</p>
            </div>
          </div>

          <div className="panel__body">
            <div className="badge" title="Quick access">
              Choose a workspace
            </div>

            <div className="cta-wrap" style={{ marginTop: 12 }}>
              <button
                className="cta cta--primary"
                onClick={goFreelancer}
                aria-label="Go to Freelancer Dashboard"
              >
                <h3 className="cta__label">Freelancer Dashboard</h3>
                <p className="cta__desc">Manage gigs, proposals, and messages.</p>
              </button>

              <button
                className="cta"
                onClick={goEmployer}
                aria-label="Go to Employer Dashboard"
              >
                <h3 className="cta__label">Employer Dashboard</h3>
                <p className="cta__desc">Post jobs, review applicants, and track hiring.</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right: user info + raw data */}
        <div className="panel">
          <div className="info">
            <div className="info__row">
              <span className="info__label">Name</span>
              <span className="info__value">
                {firstName || '—'} {lastName || ''}
              </span>
            </div>
            <div className="info__row">
              <span className="info__label">Email</span>
              <span className="info__value">{email || '—'}</span>
            </div>
            <div className="info__row">
              <span className="info__label">Auth</span>
              <span className="info__value">{session ? 'Signed in' : 'Signed out'}</span>
            </div>
          </div>

          <div className="data">
            <h2>Freelancer Dashboard Raw Data</h2>
            {error && <p style={{ color: 'var(--danger)', marginTop: 6 }}>Error: {error}</p>}
            <div className="data__box" role="region" aria-live="polite" aria-label="Raw API data">
              <pre style={{ margin: 0 }}>
                {jsonData ? JSON.stringify(jsonData, null, 2) : 'Loading...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || '';

const AdminRoute = ({ children }) => {
  const { session, loading } = UserAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait for AuthContext to finish resolving the session before deciding
    // anything — otherwise we act on a transient session=null render that
    // occurs while auth is still loading, and prematurely redirect away
    // before the real session (and the admin check) ever arrives.
    if (loading) {
      return;
    }

    const token = session?.access_token;
    if (!token) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    setChecking(true);

    fetch(`${API_BASE}/api/account-info`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch account info'))))
      .then((data) => setIsAdmin(!!data.isAdmin))
      .catch((err) => {
        console.error('Admin check error:', err);
        // Fail closed: any probe error means we do not treat the user as admin.
        setIsAdmin(false);
      })
      .finally(() => setChecking(false));
  }, [session, loading]);

  if (loading || checking) {
    return <p>Loading...</p>; // or a spinner / full-screen loader
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;

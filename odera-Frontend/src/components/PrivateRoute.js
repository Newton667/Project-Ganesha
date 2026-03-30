import React from 'react';
import { UserAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { session, loading } = UserAuth();

  if (loading) {
    return <p>Loading...</p>; // or a spinner / full-screen loader
  }

  return session ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { session, loading } = UserAuth();

  if (loading) {
    return <p>Loading...</p>; // prevent flicker on refresh
  }

  return session ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;

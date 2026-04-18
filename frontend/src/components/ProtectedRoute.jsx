import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * Enforces role-based access control (RBAC) and authentication.
 * 
 * @param {string} allowedRole - The required role for this route
 */
const ProtectedRoute = ({ allowedRole }) => {
  // Get auth state from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // 1. If not logged in, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but role mismatch, redirect to user's designated dashboard
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to the user's specific role dashboard if they try to access unauthorized path
    return <Navigate to={`/${user.role}`} replace />;
  }

  // 3. Authorized access granted
  return <Outlet />;
};

export default ProtectedRoute;

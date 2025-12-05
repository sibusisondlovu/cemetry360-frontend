import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const user = authService.getUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;



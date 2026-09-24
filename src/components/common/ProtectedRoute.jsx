import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';

export default function ProtectedRoute({ allowedRoles, children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

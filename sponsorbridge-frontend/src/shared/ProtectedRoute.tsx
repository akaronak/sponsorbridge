import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';
import { getDashboardPath, AUTH_FALLBACK } from '../config/roles';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  /** Allow multiple roles (e.g. both ORGANIZER and ADMIN) */
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Not authenticated → login page (preserve intended destination)
  if (!isAuthenticated) {
    return <Navigate to={AUTH_FALLBACK} state={{ from: location }} replace />;
  }

  // Role missing or unknown → force logout to prevent broken state
  if (!user?.role) {
    logout();
    return <Navigate to={AUTH_FALLBACK} replace />;
  }

  // Resolve the correct dashboard for this user's role (centralized)
  const homePath = getDashboardPath(user.role);

  // RBAC check — single required role
  if (requiredRole && user.role !== requiredRole) {
    // Prevent infinite redirect: if homePath === current path, deny access
    if (homePath === location.pathname) {
      return <Navigate to={AUTH_FALLBACK} replace />;
    }
    return <Navigate to={homePath} replace />;
  }

  // RBAC check — multiple allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (homePath === location.pathname) {
      return <Navigate to={AUTH_FALLBACK} replace />;
    }
    return <Navigate to={homePath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

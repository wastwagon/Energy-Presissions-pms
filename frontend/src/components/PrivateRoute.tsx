import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import { UserRole } from '../types';

export type PrivateRouteVariant = 'pms' | 'web';

const PrivateRoute: React.FC<{
  children?: React.ReactNode;
  variant?: PrivateRouteVariant;
}> = ({ children, variant = 'pms' }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    if (variant === 'web') {
      return <Navigate to="/web/admin" replace />;
    }
    return <Navigate to="/pms/admin" replace />;
  }

  if (variant === 'pms' && user?.role === UserRole.WEBSITE_ADMIN) {
    return <Navigate to="/web/app" replace />;
  }

  if (variant === 'web') {
    const allowed = user?.role === UserRole.ADMIN || user?.role === UserRole.WEBSITE_ADMIN;
    if (!allowed) {
      return <Navigate to="/pms/dashboard" replace />;
    }
  }

  return <>{children || <Outlet />}</>;
};

export default PrivateRoute;









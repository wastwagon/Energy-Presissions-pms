import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Determine which login page to redirect to based on current path
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/pms')) {
      return <Navigate to="/pms/admin" replace />;
    }
    return <Navigate to="/web/admin" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default PrivateRoute;









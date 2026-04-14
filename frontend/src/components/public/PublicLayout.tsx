import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const PublicLayout: React.FC = () => {
  const theme = useTheme();
  const isMobileNav = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          /* Space for fixed app-style bottom bar + iOS safe area */
          pb: isMobileNav ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : 0,
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default PublicLayout;




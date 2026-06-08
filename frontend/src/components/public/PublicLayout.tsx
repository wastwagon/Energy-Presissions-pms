import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import WhatsappFab from './WhatsappFab';

const PublicLayout: React.FC = () => {
  const theme = useTheme();
  const isMobileNav = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: -9999,
          zIndex: 9999,
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          textDecoration: 'none',
          fontWeight: 600,
          '&:focus': {
            left: 16,
            top: 16,
            outline: '2px solid',
            outlineColor: 'primary.main',
          },
        }}
      >
        Skip to main content
      </Box>
      <Header />
      <Box
        id="main-content"
        component="main"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          outline: 'none',
          /* Space for fixed app-style bottom bar + iOS safe area */
          pb: isMobileNav ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : 0,
        }}
      >
        <Outlet />
      </Box>
      <Footer />
      <WhatsappFab />
    </Box>
  );
};

export default PublicLayout;




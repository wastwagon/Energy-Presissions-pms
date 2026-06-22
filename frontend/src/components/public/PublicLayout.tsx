import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import WhatsappFab from './WhatsappFab';
import { pathHasStickyCta } from '../../data/stickyCtaPaths';
import { mobileMainPaddingBottom, MOBILE_CHECKOUT_BAR_RESERVE } from '../../utils/mobileChrome';

const PublicLayout: React.FC = () => {
  const theme = useTheme();
  const isMobileNav = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const hasStickyCta = pathHasStickyCta(pathname);
  const checkoutBarReserve = isMobileNav && pathname === '/checkout' ? MOBILE_CHECKOUT_BAR_RESERVE : 0;

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
          pb: isMobileNav ? mobileMainPaddingBottom(hasStickyCta, checkoutBarReserve) : 0,
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




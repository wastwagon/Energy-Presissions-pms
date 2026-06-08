import React from 'react';
import { Fab, useTheme, useMediaQuery } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { COMPANY } from '../../data/companyContact';
import { pathHasStickyCta } from '../../data/stickyCtaPaths';

/** Mobile-only floating WhatsApp — sits above bottom tab bar */
const WhatsappFab: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();

  if (!isMobile || pathHasStickyCta(pathname)) return null;

  return (
    <Fab
      component="a"
      href={COMPANY.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        zIndex: theme.zIndex.speedDial,
        bgcolor: '#25D366',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        '&:hover': { bgcolor: '#1ebe57' },
        width: 52,
        height: 52,
      }}
    >
      <ChatIcon />
    </Fab>
  );
};

export default WhatsappFab;

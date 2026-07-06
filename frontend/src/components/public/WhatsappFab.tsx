import React from 'react';
import { Fab, useTheme, useMediaQuery } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { MOBILE_TAB_BAR_RESERVE } from '../../utils/mobileChrome';
import { hapticTap } from '../../utils/haptics';

/** Mobile-only floating WhatsApp — sits above bottom tab bar */
const WhatsappFab: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { contact } = useGlobalSiteConfig();

  if (!isMobile) return null;

  return (
    <Fab
      component="a"
      href={contact.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onClick={() => hapticTap()}
      sx={{
        position: 'fixed',
        right: 16,
        bottom: `calc(${MOBILE_TAB_BAR_RESERVE}px + env(safe-area-inset-bottom, 0px) + 12px)`,
        zIndex: theme.zIndex.speedDial,
        bgcolor: colors.green,
        color: colors.blueBlack,
        '&:hover': { bgcolor: colors.greenDark },
        boxShadow: '0 4px 20px rgba(0, 230, 118, 0.35)',
      }}
    >
      <ChatIcon />
    </Fab>
  );
};

export default WhatsappFab;

import React from 'react';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { publicUi } from '../../theme/publicUi';

type Props = {
  label: string;
  to: string;
};

/** Fixed bottom CTA above mobile tab bar — Services, Packages, etc. */
const PublicStickyMobileCta: React.FC<Props> = ({ label, to }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        zIndex: theme.zIndex.appBar - 1,
        px: 2,
        py: 1,
        bgcolor: 'rgba(251, 251, 253, 0.92)',
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <Button
        component={RouterLink}
        to={to}
        fullWidth
        variant="contained"
        endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
        sx={{
          ...publicUi.primaryButton,
          ...publicUi.touchTarget,
          fontSize: '0.9375rem',
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

export default PublicStickyMobileCta;

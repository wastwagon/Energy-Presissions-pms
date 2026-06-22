import React from 'react';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { hapticTap } from '../../utils/haptics';
import { mobileFixedAboveTabBar } from '../../utils/mobileChrome';
import { publicUi } from '../../theme/publicUi';

type Props = {
  label: string;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  showArrow?: boolean;
};

/** Fixed bottom CTA above mobile tab bar — Services, tools, checkout flows, etc. */
const PublicStickyMobileCta: React.FC<Props> = ({
  label,
  to,
  onClick,
  disabled = false,
  showArrow = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  const handleClick = () => {
    hapticTap();
    onClick?.();
  };

  const buttonSx = {
    ...publicUi.primaryButton,
    ...publicUi.touchTarget,
    fontSize: '0.9375rem',
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: mobileFixedAboveTabBar(),
        zIndex: theme.zIndex.appBar - 1,
        px: 2,
        py: 1,
        bgcolor: 'rgba(251, 251, 253, 0.92)',
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {to ? (
        <Button
          component={RouterLink}
          to={to}
          fullWidth
          variant="contained"
          disabled={disabled}
          onClick={handleClick}
          endIcon={showArrow ? <ArrowForwardIcon sx={{ fontSize: 18 }} /> : undefined}
          sx={buttonSx}
        >
          {label}
        </Button>
      ) : (
        <Button
          fullWidth
          variant="contained"
          disabled={disabled}
          onClick={handleClick}
          endIcon={showArrow ? <ArrowForwardIcon sx={{ fontSize: 18 }} /> : undefined}
          sx={buttonSx}
        >
          {label}
        </Button>
      )}
    </Box>
  );
};

export default PublicStickyMobileCta;

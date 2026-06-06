import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';

type Props = {
  badge?: string;
  title?: string;
  subtitle?: string;
  dark?: boolean;
  align?: 'center' | 'left';
  maxSubtitleWidth?: number;
  compact?: boolean;
};

const HomeSectionHeader: React.FC<Props> = ({
  badge,
  title,
  subtitle,
  dark = false,
  align = 'center',
  maxSubtitleWidth = 560,
  compact = false,
}) => (
  <Box
    textAlign={align}
    mb={compact ? 0 : { xs: 3.5, md: 5 }}
    sx={{ px: align === 'left' ? 0 : { xs: 0.5, md: 0 } }}
  >
    {badge && (
      <Typography
        component="p"
        sx={{
          color: dark ? colors.green : colors.gray600,
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          mb: 1.25,
        }}
      >
        {badge}
      </Typography>
    )}
    {title && (
      <Typography
        variant="h2"
        sx={{
          ...homeUi.title,
          color: dark ? 'white' : colors.blueBlack,
          fontSize: { xs: '1.625rem', sm: '1.875rem', md: '2.125rem' },
          mb: subtitle ? { xs: 1.5, md: 2 } : 0,
          maxWidth: align === 'center' ? 720 : 'none',
          mx: align === 'center' ? 'auto' : 0,
        }}
      >
        {title}
      </Typography>
    )}
    {subtitle && (
      <Typography
        sx={{
          ...homeUi.body,
          color: dark ? 'rgba(255,255,255,0.72)' : colors.gray600,
          maxWidth: maxSubtitleWidth,
          mx: align === 'center' ? 'auto' : 0,
        }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default HomeSectionHeader;

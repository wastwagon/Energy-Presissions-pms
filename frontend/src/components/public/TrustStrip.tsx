import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import {
  Star as StarIcon,
  Engineering as EngineeringIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { TRUST_BADGES } from '../../data/trustContent';

const iconFor = (key: string) => {
  switch (key) {
    case 'google':
      return <StarIcon sx={{ fontSize: 28, color: colors.green }} />;
    case 'engineering':
      return <EngineeringIcon sx={{ fontSize: 28, color: colors.green }} />;
    default:
      return <GavelIcon sx={{ fontSize: 28, color: colors.green }} />;
  }
};

type Props = {
  /** light = white bg (below dark hero); muted = soft gray */
  variant?: 'light' | 'muted';
};

const TrustStrip: React.FC<Props> = ({ variant = 'light' }) => {
  const bg =
    variant === 'muted' ? 'linear-gradient(180deg, #f1f5f9 0%, #e8eef4 100%)' : '#ffffff';
  const border = variant === 'muted' ? '1px solid rgba(10,14,23,0.06)' : '1px solid #e8eaed';

  return (
    <Box
      component="aside"
      aria-label="Trust and credentials"
      sx={{
        py: { xs: 2.25, md: 2.75 },
        bgcolor: bg,
        background: bg,
        borderTop: border,
        borderBottom: border,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
          {TRUST_BADGES.map((b) => (
            <Grid item xs={12} sm={4} key={b.key}>
              <Box display="flex" gap={1.5} alignItems="flex-start">
                <Box sx={{ flexShrink: 0, mt: 0.25 }}>{iconFor(b.key)}</Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.blueBlack, mb: 0.35 }}>
                    {b.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.55, fontSize: '0.8125rem' }}>
                    {b.subtitle}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TrustStrip;

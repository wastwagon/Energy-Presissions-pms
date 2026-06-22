import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import HomeSectionHeader from './HomeSectionHeader';
import type { CmsProcessStep } from '../../types/cms';

type Props = {
  badge?: string;
  title?: string;
  subtitle?: string;
  steps: CmsProcessStep[];
};

const stepThemes = [
  {
    bg: 'linear-gradient(155deg, #ecfdf5 0%, #d1fae5 100%)',
    accent: '#00C85F',
    glow: 'rgba(0, 200, 95, 0.22)',
  },
  {
    bg: 'linear-gradient(155deg, #ecfeff 0%, #cffafe 100%)',
    accent: '#0891b2',
    glow: 'rgba(8, 145, 178, 0.22)',
  },
  {
    bg: 'linear-gradient(155deg, #eff6ff 0%, #dbeafe 100%)',
    accent: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.22)',
  },
  {
    bg: 'linear-gradient(155deg, #f5f3ff 0%, #ede9fe 100%)',
    accent: '#7c3aed',
    glow: 'rgba(124, 58, 237, 0.22)',
  },
  {
    bg: 'linear-gradient(155deg, #fff7ed 0%, #ffedd5 100%)',
    accent: '#ea580c',
    glow: 'rgba(234, 88, 12, 0.22)',
  },
];

const ProcessStepCard: React.FC<{ item: CmsProcessStep; index: number }> = ({ item, index }) => {
  const theme = stepThemes[index % stepThemes.length];

  return (
    <Box
      sx={{
        height: '100%',
        p: { xs: 2.25, md: 2.5 },
        borderRadius: homeUi.cardRadius,
        background: theme.bg,
        border: `1px solid ${theme.glow}`,
        boxShadow: `0 2px 12px ${theme.glow}`,
        textAlign: 'left',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 14px 36px ${theme.glow}`,
          },
        },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'white',
          boxShadow: `0 0 0 4px ${theme.glow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '0.8125rem', color: theme.accent, lineHeight: 1 }}>
          {item.step}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontWeight: 700,
          color: colors.blueBlack,
          fontSize: { xs: '0.9375rem', md: '0.975rem' },
          letterSpacing: '-0.018em',
          lineHeight: 1.25,
          mb: 0.75,
        }}
      >
        {item.title}
      </Typography>

      <Typography sx={{ ...homeUi.body, color: colors.gray600, fontSize: '0.8125rem', lineHeight: 1.5 }}>
        {item.desc}
      </Typography>
    </Box>
  );
};

const HomeProcessSection: React.FC<Props> = ({ badge, title, subtitle, steps }) => (
  <Box component="section" sx={{ bgcolor: homeUi.pageBg, py: homeUi.sectionPy }}>
    <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
      <HomeSectionHeader
        badge={badge}
        title={title}
        subtitle={subtitle}
        align="left"
        maxSubtitleWidth={520}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        {steps.map((item, index) => (
          <ProcessStepCard key={`${item.step}-${index}`} item={item} index={index} />
        ))}
      </Box>
    </Container>
  </Box>
);

export default HomeProcessSection;

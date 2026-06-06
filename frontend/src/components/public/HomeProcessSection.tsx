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

const HomeProcessSection: React.FC<Props> = ({ badge, title, subtitle, steps }) => (
  <Box component="section" sx={{ bgcolor: homeUi.cardBg, py: homeUi.sectionPy }}>
    <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
      <HomeSectionHeader badge={badge} title={title} subtitle={subtitle} maxSubtitleWidth={520} />

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, md: 2 },
          overflowX: { xs: 'auto', md: 'visible' },
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          justifyContent: { md: 'center' },
          scrollSnapType: { xs: 'x mandatory', md: 'none' },
          WebkitOverflowScrolling: 'touch',
          pb: { xs: 1, md: 0 },
          mx: { xs: -0.5, md: 0 },
          px: { xs: 0.5, md: 0 },
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {steps.map((item, index) => (
          <Box
            key={`${item.step}-${index}`}
            sx={{
              flex: { xs: '0 0 min(78vw, 280px)', md: '1 1 160px' },
              maxWidth: { md: 200 },
              scrollSnapAlign: 'start',
              p: { xs: 2.25, md: 2.5 },
              borderRadius: homeUi.innerRadius,
              bgcolor: homeUi.pageBg,
              border: homeUi.cardBorder,
              textAlign: { xs: 'left', md: 'center' },
            }}
          >
            <Typography
              sx={{
                color: colors.green,
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                mb: 1.25,
              }}
            >
              {item.step}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                color: colors.blueBlack,
                fontSize: '0.9375rem',
                letterSpacing: '-0.015em',
                mb: 0.75,
              }}
            >
              {item.title}
            </Typography>
            <Typography sx={{ ...homeUi.body, color: colors.gray600, fontSize: '0.875rem' }}>
              {item.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

export default HomeProcessSection;

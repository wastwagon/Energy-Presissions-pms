import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Verified as VerifiedIcon,
  Handshake as HandshakeIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { useCmsPage } from '../../hooks/useCmsPage';
import { getCmsDefaults } from '../../data/cmsDefaults';
import HomeSectionHeader from './HomeSectionHeader';
import type { CmsCredibility } from '../../types/cms';

const pillarIcons = [
  <EngineeringIcon sx={{ fontSize: 22 }} />,
  <VerifiedIcon sx={{ fontSize: 22 }} />,
  <HandshakeIcon sx={{ fontSize: 22 }} />,
];

type Props = {
  data?: CmsCredibility;
};

const HomeCredibility: React.FC<Props> = ({ data }) => {
  const { sections } = useCmsPage('home');
  const credibility = data ?? sections.credibility ?? getCmsDefaults('home').credibility;
  const proofs = (credibility.proofs || []).slice(0, 3);

  return (
    <Box component="section" aria-label="Why Energy Precisions" sx={{ bgcolor: homeUi.pageBg, py: homeUi.sectionPy }}>
      <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
        <HomeSectionHeader
          badge={credibility.eyebrow}
          title={credibility.headline}
          subtitle={sections.why_choose?.subtitle}
          align="left"
          maxSubtitleWidth={600}
        />

        <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
          {proofs.map((proof, index) => (
            <Grid item xs={12} md={4} key={`${proof.title}-${index}`}>
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 2.5, md: 3 },
                  borderRadius: homeUi.cardRadius,
                  bgcolor: homeUi.cardBg,
                  border: homeUi.cardBorder,
                  boxShadow: homeUi.cardShadow,
                  transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                  '@media (hover: hover)': {
                    '&:hover': {
                      boxShadow: homeUi.cardShadowHover,
                      transform: 'translateY(-2px)',
                    },
                  },
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 230, 118, 0.1)',
                    color: colors.green,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {pillarIcons[index]}
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.blueBlack,
                    fontSize: '1.0625rem',
                    letterSpacing: '-0.02em',
                    mb: 1,
                  }}
                >
                  {proof.title}
                </Typography>
                <Typography sx={{ ...homeUi.body, color: colors.gray600 }}>{proof.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomeCredibility;

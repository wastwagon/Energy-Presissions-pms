import React from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import HomeSectionHeader from './HomeSectionHeader';
import type { CmsPortfolioItem } from '../../types/cms';

type Props = {
  badge?: string;
  title?: string;
  subtitle?: string;
  items: CmsPortfolioItem[];
  ctaText?: string;
  ctaLink?: string;
};

const HomePortfolioSection: React.FC<Props> = ({
  badge,
  title,
  subtitle,
  items,
  ctaText = 'View portfolio',
  ctaLink = '/portfolio',
}) => {
  const [featured, ...rest] = items;
  if (!featured) return null;

  return (
    <Box component="section" sx={{ bgcolor: homeUi.pageBg, py: homeUi.sectionPy }}>
      <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
        <HomeSectionHeader badge={badge} title={title} subtitle={subtitle} maxSubtitleWidth={520} />

        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          <Grid item xs={12} md={7}>
            <Box
              component={Link}
              to={featured.link || ctaLink}
              sx={{
                display: 'block',
                position: 'relative',
                borderRadius: homeUi.cardRadius,
                overflow: 'hidden',
                height: { xs: 280, sm: 360, md: 420 },
                boxShadow: homeUi.cardShadow,
                textDecoration: 'none',
                '&:hover img': { transform: 'scale(1.03)' },
              }}
            >
              <Box
                component="img"
                src={resolveMediaUrl(featured.image)}
                alt={featured.alt}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10,14,23,0.75) 0%, transparent 55%)',
                }}
              />
              <Typography
                sx={{
                  position: 'absolute',
                  left: { xs: 20, md: 28 },
                  bottom: { xs: 20, md: 28 },
                  right: { xs: 20, md: 28 },
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '1.125rem', md: '1.35rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                {featured.title}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ height: '100%' }}>
              {rest.slice(0, 2).map((project) => (
                <Grid item xs={6} md={12} key={project.title} sx={{ display: 'flex' }}>
                  <Box
                    component={Link}
                    to={project.link || ctaLink}
                    sx={{
                      display: 'block',
                      position: 'relative',
                      borderRadius: homeUi.innerRadius,
                      overflow: 'hidden',
                      width: '100%',
                      minHeight: { xs: 160, md: 0 },
                      flex: 1,
                      boxShadow: homeUi.cardShadow,
                      textDecoration: 'none',
                      '&:hover img': { transform: 'scale(1.03)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={resolveMediaUrl(project.image)}
                      alt={project.alt}
                      loading="lazy"
                      sx={{
                        width: '100%',
                        height: '100%',
                        minHeight: { xs: 160, md: 200 },
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(10,14,23,0.7) 0%, transparent 60%)',
                      }}
                    />
                    <Typography
                      sx={{
                        position: 'absolute',
                        left: 16,
                        bottom: 14,
                        right: 16,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', md: '0.9375rem' },
                        lineHeight: 1.35,
                      }}
                    >
                      {project.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={{ xs: 3, md: 4 }}>
          <Button
            component={Link}
            to={ctaLink}
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{
              ...homeUi.touchTarget,
              borderRadius: 999,
              px: 3.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              bgcolor: colors.blueBlack,
              boxShadow: 'none',
              '&:hover': { bgcolor: colors.blueBlackLight, boxShadow: 'none' },
            }}
          >
            {ctaText}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePortfolioSection;

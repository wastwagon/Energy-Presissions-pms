import React from 'react';
import { Box, Container, Grid, Typography, Button, Card, CardMedia, CardContent } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { homePageImages } from '../../data/homePageMedia';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import HomeSectionHeader from './HomeSectionHeader';
import type { CmsServiceCard } from '../../types/cms';

type Props = {
  badge?: string;
  title?: string;
  subtitle?: string;
  items: CmsServiceCard[];
  viewAllText?: string;
  viewAllLink?: string;
};

const HomeServicesSection: React.FC<Props> = ({
  badge,
  title,
  subtitle,
  items,
  viewAllText = 'View all services',
  viewAllLink = '/services',
}) => (
  <Box component="section" sx={{ bgcolor: homeUi.cardBg, py: homeUi.sectionPy }}>
    <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
      <HomeSectionHeader badge={badge} title={title} subtitle={subtitle} />

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {items.map((service, index) => (
          <Grid item xs={12} sm={6} key={`${service.title}-${index}`}>
            <Card
              component={Link}
              to={service.link || '/contact?action=quote'}
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                height: '100%',
                textDecoration: 'none',
                borderRadius: homeUi.cardRadius,
                border: homeUi.cardBorder,
                boxShadow: homeUi.cardShadow,
                overflow: 'hidden',
                bgcolor: homeUi.cardBg,
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                '@media (hover: hover)': {
                  '&:hover': {
                    boxShadow: homeUi.cardShadowHover,
                    transform: 'translateY(-2px)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: '100%', sm: '42%' },
                  minHeight: { xs: 200, sm: 'auto' },
                  flexShrink: 0,
                  overflow: 'hidden',
                  bgcolor: colors.gray100,
                }}
              >
                <CardMedia
                  component="img"
                  image={resolveMediaUrl(service.image) || homePageImages.services.residential}
                  alt={service.title}
                  loading="lazy"
                  sx={{
                    height: '100%',
                    minHeight: { xs: 200, sm: 220 },
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <CardContent
                sx={{
                  flex: 1,
                  p: { xs: 2.5, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.blueBlack,
                    fontSize: { xs: '1.125rem', md: '1.2rem' },
                    letterSpacing: '-0.02em',
                    mb: 1,
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  sx={{
                    ...homeUi.body,
                    color: colors.gray600,
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {service.description}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: colors.green,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    mt: 'auto',
                  }}
                >
                  {service.button_text || 'Learn more'}
                  <ChevronRightIcon sx={{ fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={{ xs: 3, md: 4 }}>
        <Button
          component={Link}
          to={viewAllLink}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
          sx={{
            ...homeUi.touchTarget,
            borderRadius: 999,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: colors.blueBlack,
            border: homeUi.cardBorder,
            bgcolor: homeUi.pageBg,
            '&:hover': { bgcolor: colors.gray100, border: homeUi.cardBorder },
          }}
        >
          {viewAllText}
        </Button>
      </Box>
    </Container>
  </Box>
);

export default HomeServicesSection;

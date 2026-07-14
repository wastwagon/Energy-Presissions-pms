import React from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
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

const ServiceCard: React.FC<{ service: CmsServiceCard; eagerImage?: boolean }> = ({
  service,
  eagerImage,
}) => (
  <Box
    component={Link}
    to={service.link || '/contact?action=quote'}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      textDecoration: 'none',
      borderRadius: homeUi.cardRadius,
      overflow: 'hidden',
      bgcolor: homeUi.cardBg,
      border: homeUi.cardBorder,
      boxShadow: homeUi.cardShadow,
      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      '&:active': { transform: 'scale(0.98)' },
      '@media (hover: hover)': {
        '&:hover': {
          boxShadow: homeUi.cardShadowHover,
          transform: 'translateY(-3px)',
          '& .service-photo': { transform: 'scale(1.04)' },
          '& .service-link': { color: colors.greenDark },
        },
      },
    }}
  >
    <Box
      sx={{
        position: 'relative',
        aspectRatio: { xs: '16 / 10', md: '16 / 10' },
        overflow: 'hidden',
        bgcolor: colors.gray100,
      }}
    >
      <Box
        className="service-photo"
        component="img"
        src={resolveMediaUrl(service.image) || homePageImages.services.residential}
        alt={service.title}
        loading={eagerImage ? 'eager' : 'lazy'}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.55s ease',
        }}
      />
    </Box>

    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        p: { xs: 2.25, md: 2.75 },
      }}
    >
      <Typography
        sx={{
          ...homeUi.headingSm,
          color: colors.blueBlack,
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
          flex: 1,
        }}
      >
        {service.description}
      </Typography>
      <Box
        className="service-link"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.35,
          color: colors.green,
          fontWeight: 600,
          fontSize: homeUi.body.fontSize,
          transition: 'color 0.2s ease',
        }}
      >
        {service.button_text || 'Learn more'}
        <ChevronRightIcon sx={{ fontSize: 20 }} />
      </Box>
    </Box>
  </Box>
);

const HomeServicesSection: React.FC<Props> = ({
  badge,
  title,
  subtitle,
  items,
  viewAllText = 'View all services',
  viewAllLink = '/services',
}) => {
  const visible = items.slice(0, 6);

  return (
  <Box component="section" sx={{ bgcolor: homeUi.pageBg, py: homeUi.sectionPy }}>
    <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
      <HomeSectionHeader badge={badge} title={title} subtitle={subtitle} align="left" />

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {visible.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${service.title}-${index}`} sx={{ display: 'flex' }}>
            <ServiceCard service={service} eagerImage={index < 3} />
          </Grid>
        ))}
      </Grid>

      <Box mt={{ xs: 3, md: 4 }}>
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
            fontSize: homeUi.body.fontSize,
            color: colors.blueBlack,
            bgcolor: homeUi.cardBg,
            border: homeUi.cardBorder,
            boxShadow: homeUi.cardShadow,
            '&:hover': { bgcolor: homeUi.cardBg, boxShadow: homeUi.cardShadowHover },
          }}
        >
          {viewAllText}
        </Button>
      </Box>
    </Container>
  </Box>
  );
};

export default HomeServicesSection;

import React from 'react';
import { Box, Container, Grid, Typography, Divider } from '@mui/material';
import { Star as StarIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import HomeSectionHeader from './HomeSectionHeader';

type Testimonial = {
  name: string;
  location: string;
  role: string;
  text: string;
  rating: number;
};

type Props = {
  badge?: string;
  title?: string;
  subtitle?: string;
  items: Testimonial[];
};

const HomeTestimonialsSection: React.FC<Props> = ({ badge, title, subtitle, items }) => (
  <Box id="testimonials" component="section" sx={{ bgcolor: homeUi.cardBg, py: homeUi.sectionPy }}>
    <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
      <HomeSectionHeader badge={badge} title={title} subtitle={subtitle} align="left" />

      <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
        {items.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={`${testimonial.name}-${index}`}>
            <Box
              sx={{
                height: '100%',
                p: { xs: 2.5, md: 3 },
                borderRadius: homeUi.cardRadius,
                bgcolor: homeUi.pageBg,
                border: homeUi.cardBorder,
                boxShadow: homeUi.cardShadow,
                transition: 'transform 0.2s ease',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box display="flex" gap={0.35} mb={1.5}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} sx={{ color: '#f59e0b', fontSize: '1rem' }} />
                ))}
              </Box>
              <Typography
                sx={{
                  ...homeUi.body,
                  color: colors.gray800,
                  mb: 2,
                  fontStyle: 'normal',
                }}
              >
                “{testimonial.text}”
              </Typography>
              <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)', mb: 2 }} />
              <Typography sx={{ fontWeight: 700, color: colors.blueBlack, fontSize: '0.9375rem' }}>
                {testimonial.name}
              </Typography>
              <Typography sx={{ color: colors.gray600, fontSize: '0.8125rem', mt: 0.25 }}>
                {testimonial.role}
              </Typography>
              <Typography
                sx={{
                  color: colors.gray400,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.35,
                  mt: 0.5,
                }}
              >
                <LocationIcon sx={{ fontSize: 14 }} />
                {testimonial.location}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default HomeTestimonialsSection;

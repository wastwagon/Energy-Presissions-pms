import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

const portfolioItems = [
  {
    id: 1,
    title: 'Residential Solar Installation - Accra',
    category: 'Residential',
    description: 'Complete 5kW home solar system with battery backup for a family in East Legon.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    location: 'Accra, Ghana',
  },
  {
    id: 2,
    title: 'Commercial Office Solar - Kumasi',
    category: 'Commercial',
    description: '25kW solar installation for a corporate office building with smart monitoring.',
    image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=800',
    location: 'Kumasi, Ghana',
  },
  {
    id: 3,
    title: 'Industrial Facility - Tema',
    category: 'Industrial',
    description: '100kW hybrid solar system for manufacturing facility with battery storage.',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800',
    location: 'Tema, Ghana',
  },
  {
    id: 4,
    title: 'School Solar Project',
    category: 'Education',
    description: 'Off-grid solar solution for rural school providing 24/7 power for learning.',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800',
    location: 'Northern Region',
  },
  {
    id: 5,
    title: 'Hospital Backup Power',
    category: 'Healthcare',
    description: 'Critical backup solar system ensuring uninterrupted power for medical equipment.',
    image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=800',
    location: 'Greater Accra',
  },
  {
    id: 6,
    title: 'Residential Estate',
    category: 'Residential',
    description: 'Multiple home installations across a new residential development.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    location: 'Accra, Ghana',
  },
];

const Portfolio: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: `radial-gradient(circle at 100% 50%, ${colors.green}15 0%, transparent 60%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" maxWidth={720} mx="auto">
            <Chip
              label="OUR WORK"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                fontWeight: 700,
                mb: 2,
                px: 2,
                py: 0.5,
                letterSpacing: 1,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              Projects That Power Ghana
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 400,
                lineHeight: 1.8,
              }}
            >
              Explore our completed solar installations across residential, commercial, and industrial sectors.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Portfolio Grid */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {portfolioItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: colors.gray200,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 24px 48px rgba(0,0,0,0.12)`,
                      borderColor: colors.green,
                      '& .portfolio-image': {
                        transform: 'scale(1.05)',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 260,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: colors.gray200,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={item.title}
                      className="portfolio-image"
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                      }}
                    >
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          bgcolor: colors.green,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: colors.blueBlack,
                        mb: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.gray600,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {item.location}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.gray600, lineHeight: 1.6 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Start Your Solar Project
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
            Join hundreds of satisfied customers. Get a free quote for your project.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/contact?action=quote"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: colors.green,
              color: 'white',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: colors.greenDark },
            }}
          >
            Get Free Quote
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Portfolio;

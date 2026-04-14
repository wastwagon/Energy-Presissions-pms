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
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { portfolioPageItems } from '../../data/portfolioPageItems';

const Portfolio: React.FC = () => {
  return (
    <Box>
      <Seo
        title="Solar Project Portfolio Ghana | Energy Precisions"
        description="Residential, commercial, industrial and community solar projects across Ghana — design, installation and support from Energy Precisions."
        path="/portfolio"
      />
      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
          color: 'white',
          py: { xs: 5, md: 6 },
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
                mb: 1.5,
                px: 1.75,
                height: 'auto',
                fontSize: '0.7rem',
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.35rem' },
                fontWeight: 800,
                mb: 1.5,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Projects That Power Ghana
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.88)',
                fontWeight: 400,
                lineHeight: 1.65,
                fontSize: { xs: '0.95rem', md: '1rem' },
              }}
            >
              Explore our completed solar installations across residential, commercial, and industrial sectors.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Portfolio Grid */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {portfolioPageItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: colors.gray200,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                      borderColor: colors.green,
                      '& .portfolio-image': {
                        transform: 'scale(1.03)',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 200, sm: 220 },
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
                  <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.25 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: colors.blueBlack,
                        mb: 0.75,
                        lineHeight: 1.3,
                        fontSize: '0.95rem',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.gray600,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {item.location}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.gray600, lineHeight: 1.55, fontSize: '0.82rem' }}>
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
          py: { xs: 6, md: 7 },
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            Start Your Solar Project
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', mb: 2.5, lineHeight: 1.6 }}>
            Join hundreds of satisfied customers. Get a free quote for your project.
          </Typography>
          <Button
            variant="contained"
            size="medium"
            component={Link}
            to="/contact?action=quote"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: colors.green,
              color: 'white',
              px: 3.5,
              py: 1.15,
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

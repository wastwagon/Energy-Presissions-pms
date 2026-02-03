import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Nature as EcoIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import websiteContent from '../../data/extracted_content.json';

const About: React.FC = () => {
  const content = websiteContent;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#1a4d7a',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="ABOUT ENERGY PRECISIONS"
                sx={{
                  bgcolor: '#00E676',
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 3,
                  px: 2,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 3,
                  lineHeight: 1.1,
                }}
              >
                Ghana's Premier Solar Energy Company
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.8,
                  fontWeight: 400,
                  mb: 4,
                }}
              >
                {content.about.content}
              </Typography>
              <Stack direction="row" spacing={4} flexWrap="wrap">
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00E676' }}>
                    500+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Installations
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00E676' }}>
                    10+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Years Experience
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00E676' }}>
                    98%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Satisfaction Rate
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              >
                <Box
                  component="img"
                  src="/website_images/remove-bg3.png"
                  alt="Energy Precisions Team"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  p: 5,
                  borderRadius: 3,
                  border: '2px solid #00E676',
                  bgcolor: '#f8f9fa',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    mb: 3,
                    fontWeight: 800,
                    color: '#1a4d7a',
                  }}
                >
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  To empower every Ghanaian home and business with reliable, affordable solar energy solutions. 
                  We believe in sustainable energy practices that preserve our planet while reducing energy costs 
                  and increasing energy independence across Ghana.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  p: 5,
                  borderRadius: 3,
                  border: '2px solid #1a4d7a',
                  bgcolor: 'white',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    mb: 3,
                    fontWeight: 800,
                    color: '#1a4d7a',
                  }}
                >
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  To become Ghana's most trusted and recognized solar energy company, leading the transition 
                  to clean energy. We envision a future where every Ghanaian has access to reliable, 
                  sustainable solar power that powers their dreams and ambitions.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={8}>
            <Chip
              label="WHY CHOOSE US"
              sx={{
                bgcolor: '#00E676',
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
                px: 2,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: '#1a4d7a',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              What Makes Us Ghana's Best
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <LocationIcon sx={{ fontSize: '3rem' }} />,
                title: 'Based in Ghana, For Ghana',
                description: 'We understand Ghana\'s unique energy challenges and climate. Our solutions are specifically designed for Ghanaian homes and businesses.',
                color: '#00E676',
              },
              {
                icon: <BusinessIcon sx={{ fontSize: '3rem' }} />,
                title: 'Complete Solutions Provider',
                description: 'From equipment sales to installation, maintenance, and support - we provide end-to-end solar solutions under one roof.',
                color: '#1a4d7a',
              },
              {
                icon: <PeopleIcon sx={{ fontSize: '3rem' }} />,
                title: 'Expert Team',
                description: 'Our certified technicians have years of experience installing solar systems across Ghana. Continuous training ensures we stay ahead.',
                color: '#00E676',
              },
              {
                icon: <SecurityIcon sx={{ fontSize: '3rem' }} />,
                title: 'Trusted & Reliable',
                description: '10+ years in business, 500+ successful installations, and 98% customer satisfaction. Your trust is our greatest asset.',
                color: '#1a4d7a',
              },
              {
                icon: <TrendingUpIcon sx={{ fontSize: '3rem' }} />,
                title: 'Proven Track Record',
                description: 'Trusted by residential, commercial, and industrial clients across Accra, Kumasi, Tamale, and beyond.',
                color: '#00E676',
              },
              {
                icon: <EcoIcon sx={{ fontSize: '3rem' }} />,
                title: 'Sustainable Future',
                description: 'Join thousands of Ghanaians reducing electricity costs and carbon footprint. Together, we build a greener Ghana.',
                color: '#1a4d7a',
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: '#1a4d7a',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Our Values */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={8}>
            <Chip
              label="OUR VALUES"
              sx={{
                bgcolor: '#00E676',
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
                px: 2,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: '#1a4d7a',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              What We Stand For
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {content.about.specialties.map((specialty, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#00E676',
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Chip
                      label={specialty}
                      sx={{
                        bgcolor: '#00E676',
                        color: 'white',
                        fontWeight: 'bold',
                        px: 2,
                        py: 3,
                        fontSize: '1rem',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#1a4d7a', color: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={8}>
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Our Impact in Numbers
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {content.about.stats.map((stat, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box textAlign="center">
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', md: '5rem' },
                      fontWeight: 800,
                      color: '#00E676',
                      mb: 2,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      color: 'white',
                      fontWeight: 700,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.8,
                    }}
                  >
                    {stat.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Location & Contact */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={6}>
            <Chip
              label="VISIT US"
              sx={{
                bgcolor: '#00E676',
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
                px: 2,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: '#1a4d7a',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Located in the Heart of Accra
            </Typography>
            <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
              Serving all of Ghana with expert solar solutions
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                <Stack spacing={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationIcon sx={{ fontSize: '2.5rem', color: '#00E676' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a4d7a', mb: 0.5 }}>
                        Our Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666' }}>
                        Haatso, Ecomog, Accra, Ghana
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                      Visit our showroom to see our products in person, meet our team, and get expert 
                      advice on the best solar solution for your needs. We're open Monday to Saturday, 
                      8:00 AM to 6:00 PM.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, borderRadius: 3, height: '100%', bgcolor: '#1a4d7a', color: 'white' }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  Ready to Go Solar?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
                  Contact us today for a free consultation. Our team will assess your energy needs 
                  and provide a customized solar solution for your home or business.
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PhoneIcon sx={{ color: '#00E676' }} />
                    <Typography variant="body1">(+233) 533 611 611</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EmailIcon sx={{ color: '#00E676' }} />
                    <Typography variant="body1">energyprecisions@gmail.com</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default About;

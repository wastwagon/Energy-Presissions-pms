import React, { useEffect, useState } from 'react';
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
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Nature as EcoIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
} from '@mui/icons-material';
import websiteContent from '../../data/extracted_content.json';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { homePageImages } from '../../data/homePageMedia';
import api from '../../services/api';
import TrustStrip from '../../components/public/TrustStrip';

const About: React.FC = () => {
  const content = websiteContent;
  const [aboutHero, setAboutHero] = useState<string>(homePageImages.hero);
  const whyScrollRef = React.useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const whyChooseFeatures = [
    {
      icon: <LocationIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Based in Ghana, For Ghana',
      description: 'We understand Ghana\'s unique energy challenges and climate. Our solutions are specifically designed for Ghanaian homes and businesses.',
      color: colors.green,
    },
    {
      icon: <BusinessIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Complete Solutions Provider',
      description: 'From equipment sales to installation, maintenance, and support - we provide end-to-end solar solutions under one roof.',
      color: colors.blueNavy,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Expert Team',
      description: 'Our certified technicians have years of experience installing solar systems across Ghana. Continuous training ensures we stay ahead.',
      color: colors.green,
    },
    {
      icon: <SecurityIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Trusted & Reliable',
      description: '10+ years in business, 500+ successful installations, and 98% customer satisfaction. Your trust is our greatest asset.',
      color: colors.blueNavy,
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Proven Track Record',
      description: 'Trusted by residential, commercial, and industrial clients across Accra, Kumasi, Tamale, and beyond.',
      color: colors.green,
    },
    {
      icon: <EcoIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Sustainable Future',
      description: 'Join thousands of Ghanaians reducing electricity costs and carbon footprint. Together, we build a greener Ghana.',
      color: colors.blueNavy,
    },
  ];

  const goFeaturePrev = () => {
    const el = whyScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -Math.min(el.clientWidth * 0.9, 420), behavior: 'smooth' });
  };
  const goFeatureNext = () => {
    const el = whyScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.min(el.clientWidth * 0.9, 420), behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get<Record<string, string>>('/content/settings/public')
      .then((res) => {
        const u = res.data?.about_hero_image?.trim();
        if (u && !cancelled) setAboutHero(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <Seo
        title="About Energy Precisions | Ghana Solar Company"
        description="Ghana's premier solar energy company — turnkey solutions from design and installation to equipment and maintenance. Learn our story and values."
        path="/about"
      />
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: colors.blueBlack,
          color: 'white',
          py: { xs: 5, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="ABOUT ENERGY PRECISIONS"
                sx={{
                  bgcolor: colors.green,
                  color: 'white',
                  fontWeight: 700,
                  mb: 1.5,
                  px: 1.75,
                  height: 'auto',
                  fontSize: '0.7rem',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.35rem' },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.15,
                }}
              >
                Ghana's Premier Solar Energy Company
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.65,
                  fontWeight: 400,
                  mb: 2.5,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                }}
              >
                {content.about.content}
              </Typography>
              <Stack direction="row" spacing={{ xs: 2, sm: 3 }} flexWrap="wrap" useFlexGap>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                    500+
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Installations
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                    10+
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Years Experience
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                    98%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Satisfaction Rate
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                  maxHeight: { xs: 280, md: 400 },
                }}
              >
                <Box
                  component="img"
                  src={aboutHero}
                  alt="Energy Precisions solar installation"
                  sx={{
                    width: '100%',
                    height: '100%',
                    maxHeight: { xs: 280, md: 400 },
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('/website_images/')) {
                      target.src = '/website_images/remove-bg3.png';
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <TrustStrip variant="muted" />

      {/* Mission & Vision */}
      <Box
        sx={{
          py: { xs: 6, md: 9 },
          bgcolor: 'white',
          backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${colors.gray100} 100%)`,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `2px solid ${colors.green}`,
                  bgcolor: 'white',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    mb: 3,
                    fontWeight: 800,
                    color: colors.blueBlack,
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
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `2px solid ${colors.blueNavy}`,
                  bgcolor: colors.blueNavy,
                  color: 'white',
                  boxShadow: '0 18px 44px rgba(7, 26, 50, 0.28)',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    mb: 3,
                    fontWeight: 800,
                    color: 'white',
                  }}
                >
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, fontSize: '1.1rem' }}>
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
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#f6f8fb',
          backgroundImage: 'radial-gradient(circle at top right, rgba(0,230,118,0.08), transparent 36%)',
        }}
      >
        <Container maxWidth="xl">
          <Box textAlign="center" mb={8}>
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '2.05rem', md: '3.15rem' },
                lineHeight: 1.15,
              }}
            >
              What Makes Us Ghana's Best
            </Typography>
            <Box display="flex" justifyContent="center" gap={1.5} mt={2}>
              <IconButton
                onClick={goFeaturePrev}
                aria-label="Previous cards"
                sx={{
                  border: '1px solid #d4deea',
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f2f6fb' },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                onClick={goFeatureNext}
                aria-label="Next cards"
                sx={{
                  border: '1px solid #d4deea',
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f2f6fb' },
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          <Box
            ref={whyScrollRef}
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              pb: 1.25,
              px: { xs: 0.5, md: 0 },
              scrollBehavior: 'smooth',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(10,14,23,0.22)',
                borderRadius: 999,
              },
            }}
          >
            {whyChooseFeatures.map((feature, index) => (
            <Box
              key={index}
              sx={{
                flex: '0 0 min(100%, 365px)',
                maxWidth: { xs: 'min(100%, 335px)', sm: 'min(100%, 360px)', md: 'min(100%, 365px)' },
                scrollSnapAlign: 'start',
              }}
            >
                <Card
                  sx={{
                    height: '100%',
                    p: { xs: 2.25, md: 2.5 },
                    borderRadius: 3,
                    border: '1px solid #d9e3ee',
                    bgcolor: 'white',
                    transition: 'box-shadow 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: '#d9e3ee',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: colors.blueNavy,
                      mb: 1.75,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(26, 77, 122, 0.1)',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 1.25,
                      fontWeight: 700,
                      color: colors.blueNavy,
                      fontSize: { xs: '1.5rem', md: '1.35rem' },
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.65, fontSize: '0.98rem' }}>
                    {feature.description}
                  </Typography>
                </Card>
            </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Our Values */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#ffffff',
          borderTop: '1px solid #eaf0f7',
          borderBottom: '1px solid #eaf0f7',
          backgroundImage:
            'linear-gradient(180deg, rgba(246,248,251,0.55) 0%, rgba(255,255,255,1) 45%, rgba(255,255,255,1) 100%)',
        }}
      >
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 5, md: 6 }}>
            <Chip
              label="OUR VALUES"
              sx={{
                bgcolor: colors.green,
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
                mb: 1.5,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '1.9rem', md: '2.8rem' },
                lineHeight: 1.16,
              }}
            >
              What We Stand For
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 680,
                mx: 'auto',
                color: '#667085',
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.75,
              }}
            >
              Our values define how we design systems, serve clients, and deliver long-term solar
              performance across Ghana.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {content.about.specialties.map((specialty, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: { xs: 2.75, md: 3 },
                    borderRadius: 3,
                    border: '1px solid #d9e3ef',
                    bgcolor: '#ffffff',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: { xs: 158, md: 176 },
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(7, 26, 50, 0.05)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${colors.green} 0%, ${colors.greenLight} 100%)`,
                    },
                    '&:hover': {
                      borderColor: colors.green,
                      transform: 'translateY(-4px)',
                      boxShadow: '0 14px 30px rgba(7, 26, 50, 0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: colors.blueNavy,
                        bgcolor: 'rgba(0, 230, 118, 0.12)',
                        mb: 1.5,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: colors.blueNavy,
                        fontWeight: 700,
                        fontSize: { xs: '1.25rem', md: '1.55rem' },
                        lineHeight: 1.3,
                      }}
                    >
                      {specialty}
                    </Typography>
                  </CardContent>
                  <Box
                    sx={{
                      width: 56,
                      height: 3,
                      borderRadius: 999,
                      bgcolor: colors.green,
                      mt: 2,
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: colors.blueNavy,
          color: 'white',
          backgroundImage: 'linear-gradient(135deg, rgba(7,26,50,1) 0%, rgba(8,42,72,1) 60%, rgba(6,70,88,1) 100%)',
        }}
      >
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

          <Grid container spacing={4}>
            {content.about.stats.map((stat, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    height: '100%',
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', md: '5rem' },
                      fontWeight: 800,
                      color: colors.green,
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
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Location & Contact */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#f8f9fa',
          backgroundImage: 'radial-gradient(circle at top left, rgba(0,230,118,0.07), transparent 38%)',
        }}
      >
        <Container maxWidth="xl">
          <Box textAlign="center" mb={6}>
            <Chip
              label="VISIT US"
              sx={{
                bgcolor: colors.green,
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
                color: colors.blueBlack,
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
              <Card sx={{ p: 4, borderRadius: 3, height: '100%', boxShadow: '0 14px 38px rgba(0,0,0,0.08)' }}>
                <Stack spacing={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationIcon sx={{ fontSize: '2.5rem', color: colors.green }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.blueNavy, mb: 0.5 }}>
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
              <Card
                sx={{
                  p: 4,
                  borderRadius: 3,
                  height: '100%',
                  bgcolor: colors.blueNavy,
                  color: 'white',
                  boxShadow: '0 18px 42px rgba(7, 26, 50, 0.32)',
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  Ready to Go Solar?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
                  Contact us today for a free consultation. Our team will assess your energy needs 
                  and provide a customized solar solution for your home or business.
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PhoneIcon sx={{ color: colors.green }} />
                    <Typography variant="body1">(+233) 533 611 611</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EmailIcon sx={{ color: colors.green }} />
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

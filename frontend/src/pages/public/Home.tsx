import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Divider,
  CardMedia,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Nature as EcoIcon,
  Verified as VerifiedIcon,
  LocalShipping as ShippingIcon,
  SupportAgent as SupportIcon,
  Security as SecurityIcon,
  FlashOn as SpeedIcon,
  EmojiEvents as PremiumIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Factory as FactoryIcon,
  Agriculture as AgricultureIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { homePageImages, homePortfolioPreview } from '../../data/homePageMedia';
import api from '../../services/api';

const Home: React.FC = () => {
  const [heroSrc, setHeroSrc] = useState<string>(homePageImages.hero);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Record<string, string>>('/content/settings/public')
      .then((res) => {
        const u = res.data?.home_hero_image?.trim();
        if (u && !cancelled) setHeroSrc(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <Seo
        title="Energy Precisions | Solar Panels Ghana · Solar Installation Accra"
        description="Turnkey solar in Ghana: design, installation, premium equipment and maintenance. Residential, commercial, industrial and agricultural solar. Request a quote."
        path="/"
      />
      {/* Hero - Premium */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 50%, ${colors.blueNavy} 100%)`,
          color: 'white',
          py: { xs: 5, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(0, 230, 118, 0.12) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle at 100% 100%, rgba(0, 230, 118, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Ghana's Premier Solar Energy Brand"
                sx={{
                  bgcolor: colors.green,
                  color: 'white',
                  fontWeight: 700,
                  mb: { xs: 1.5, md: 2 },
                  px: 1.75,
                  py: 0.25,
                  height: 'auto',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  letterSpacing: 0.4,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.85rem', sm: '2.15rem', md: '2.5rem', lg: '2.85rem' },
                  fontWeight: 800,
                  mb: { xs: 1.5, md: 2 },
                  lineHeight: { xs: 1.2, md: 1.15 },
                  letterSpacing: '-0.025em',
                }}
              >
                Powering Ghana's Future with{' '}
                <Box
                  component="span"
                  sx={{
                    color: colors.green,
                    textShadow: '0 0 32px rgba(0, 230, 118, 0.45)',
                  }}
                >
                  Clean Energy
                </Box>
              </Typography>
              <Typography
                variant="subtitle1"
                component="p"
                sx={{
                  mb: { xs: 2, md: 2.5 },
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.65,
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', md: '1.02rem' },
                  maxWidth: { xs: '100%', md: '95%' },
                }}
              >
                Turnkey solar from engineering and premium equipment to installation and ongoing
                maintenance — for homes, businesses, industry, and agricultural & productive-use
                projects across Ghana. Built for a market growing 20%+ year on year, with the
                service depth local installers rarely match.
              </Typography>

              <Stack
                direction="row"
                spacing={{ xs: 2, sm: 4 }}
                sx={{ mb: { xs: 2, md: 2.5 }, flexWrap: 'wrap', rowGap: 1.5 }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                    500+
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.75rem' }}>
                    Installations
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                    10+
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.75rem' }}>
                    Years Experience
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                    98%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.75rem' }}>
                    Customer Satisfaction
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  size="medium"
                  component={Link}
                  to="/contact?action=quote"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    bgcolor: colors.green,
                    color: 'white',
                    px: 3,
                    py: 1.25,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: `0 4px 16px ${colors.green}35`,
                    '&:hover': {
                      bgcolor: colors.greenDark,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 8px 24px ${colors.green}45`,
                    },
                    transition: 'all 0.22s ease',
                  }}
                >
                  Get Free Quote
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  component={Link}
                  to="/shop"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.55)',
                    borderWidth: 1.5,
                    color: 'white',
                    px: 3,
                    py: 1.25,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: colors.green,
                      bgcolor: 'rgba(0, 230, 118, 0.08)',
                      borderWidth: 1.5,
                    },
                    transition: 'all 0.22s ease',
                  }}
                >
                  Browse Products
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                  maxHeight: { xs: 280, sm: 320, md: 380, lg: 420 },
                  mx: { xs: 0, md: 'auto' },
                }}
              >
                <Box
                  component="img"
                  src={heroSrc}
                  alt="Energy Precisions Solar Installation"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    maxHeight: { xs: 280, sm: 320, md: 380, lg: 420 },
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('/website_images/')) {
                      target.src = '/website_images/remove-bg3.png';
                    } else {
                      target.style.display = 'none';
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Bar — compact strip (Webflow-style social proof) */}
      <Box sx={{ bgcolor: colors.gray100, py: { xs: 2.5, md: 3 }, borderBottom: `1px solid ${colors.gray200}` }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center" justifyContent="center">
            {[
              { icon: <VerifiedIcon />, text: 'Certified Installers' },
              { icon: <SecurityIcon />, text: '10-Year Warranty' },
              { icon: <ShippingIcon />, text: 'Free Delivery in Ghana' },
              { icon: <SupportIcon />, text: 'Maintenance & After-Sales' },
            ].map((item, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                  <Box sx={{ color: colors.green, fontSize: { xs: '1.65rem', md: '1.85rem' }, flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.blueBlack, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {item.text}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us — value props grid */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label="WHY CHOOSE ENERGY PRECISIONS"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                fontWeight: 700,
                mb: 1.5,
                px: 1.75,
                py: 0.25,
                height: 'auto',
                fontSize: '0.7rem',
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 1.5,
                mb: 2,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '1.65rem', sm: '1.85rem', md: '2.25rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Ghana's Most Trusted Solar Partner
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: colors.gray600, maxWidth: 640, mx: 'auto', fontWeight: 400, lineHeight: 1.65, fontSize: { xs: '0.95rem', md: '1rem' } }}
            >
              Deep Accra roots, Ghana-wide ambition: we combine local market knowledge with
              turnkey delivery — so you get one accountable partner from design through
              maintenance, not a one-off installation.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[
              { icon: <PremiumIcon sx={{ fontSize: '2.25rem' }} />, title: 'Premium Quality Equipment', description: 'We source only the finest solar panels, inverters, and batteries from leading global manufacturers. Every product is tested and certified for Ghana\'s climate.', color: colors.green },
              { icon: <SpeedIcon sx={{ fontSize: '2.25rem' }} />, title: 'Expert Installation Team', description: 'Our certified technicians have installed over 500 solar systems across Ghana. Professional installation ensures maximum efficiency and longevity.', color: colors.blueBlack },
              { icon: <SecurityIcon sx={{ fontSize: '2.25rem' }} />, title: 'Comprehensive Warranty', description: '10-year warranty on installations, 25-year panel warranty, and lifetime support. Your investment is protected with our comprehensive coverage.', color: colors.green },
              { icon: <SupportIcon sx={{ fontSize: '2.25rem' }} />, title: 'Local Partner, Full Lifecycle', description: 'Accra-based team with national reach: responsive support, maintenance, and after-sales service — closing the gap many installers leave open after commissioning.', color: colors.blueBlack },
              { icon: <TrendingUpIcon sx={{ fontSize: '2.25rem' }} />, title: 'Proven Track Record', description: 'Trusted by residential, commercial, and industrial clients across Ghana. See our case studies and customer testimonials.', color: colors.green },
              { icon: <EcoIcon sx={{ fontSize: '2.25rem' }} />, title: 'Sustainable Future', description: 'Join thousands of Ghanaians reducing electricity costs and carbon footprint. Make a positive impact on Ghana\'s energy future.', color: colors.blueBlack },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: { xs: 2.5, md: 3 },
                    border: `1px solid ${colors.gray200}`,
                    borderRadius: 2,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 10px 28px rgba(0,0,0,0.07)',
                    },
                  }}
                >
                  <Box sx={{ color: feature.color, mb: 1.5 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 1.25, fontWeight: 700, color: colors.blueBlack, fontSize: '1.05rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray600, lineHeight: 1.65 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services — image-led cards (swap URLs in data/homePageMedia.ts for CMS) */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label="OUR SERVICES"
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
              variant="h2"
              sx={{
                mt: 1.5,
                mb: 2,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '1.65rem', sm: '1.85rem', md: '2.25rem' },
                lineHeight: 1.2,
              }}
            >
              Complete Solar Solutions for Ghana
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: colors.gray600, maxWidth: 640, mx: 'auto', fontWeight: 400, fontSize: { xs: '0.95rem', md: '1rem' }, lineHeight: 1.65 }}
            >
              Residential, commercial, industrial — plus agricultural and productive-use solar.
              One partner for equipment, engineering, installation, and long-term performance.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[
              { icon: <HomeIcon />, title: 'Residential Solar', description: 'Complete home solar systems with battery backup. Reduce your electricity bills by up to 90% with our premium residential solutions.', features: ['Grid-tied & Off-grid Systems', 'Battery Storage Options', 'Smart Monitoring', 'Maintenance Support'], image: homePageImages.services.residential, link: '/services/residential' },
              { icon: <BusinessIcon />, title: 'Commercial Solar', description: 'Large-scale solar installations for businesses, offices, and commercial buildings. Maximize ROI with our commercial solar solutions.', features: ['Custom System Design', 'ROI Analysis', 'Minimal Business Disruption', 'Long-term Savings'], image: homePageImages.services.commercial, link: '/services/commercial' },
              { icon: <FactoryIcon />, title: 'Industrial Solar', description: 'Heavy-duty solar systems for factories and industrial facilities. Power your operations with reliable, cost-effective solar energy.', features: ['High-Capacity Systems', 'Industrial-Grade Equipment', 'Custom Engineering', '24/7 Monitoring'], image: homePageImages.services.industrial, link: '/services/industrial' },
              { icon: <AgricultureIcon />, title: 'Agricultural & Productive Use', description: 'Solar for irrigation, cold chain, and processing — cutting diesel costs and unlocking reliable power where the grid is weak or absent.', features: ['Irrigation & Pumping', 'Processing & Storage', 'Off-grid & Hybrid Designs', 'Scalable for Cooperatives'], image: homePageImages.services.agricultural, link: '/contact?action=quote' },
            ].map((service, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${colors.gray200}`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                      borderColor: colors.green,
                    },
                  }}
                >
                  <Box sx={{ height: { xs: 160, sm: 180 }, overflow: 'hidden', bgcolor: colors.gray200 }}>
                    <CardMedia
                      component="img"
                      image={service.image}
                      alt={service.title}
                      loading="lazy"
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                        '&:hover': { transform: 'scale(1.04)' },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.5 } }}>
                    <Box sx={{ color: colors.green, fontSize: '2rem', mb: 1.25 }}>{service.icon}</Box>
                    <Typography variant="h6" sx={{ mb: 1.25, fontWeight: 700, color: colors.blueBlack, fontSize: '1.05rem' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: colors.gray600, lineHeight: 1.65 }}>
                      {service.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {service.features.map((feature, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                          <CheckCircleIcon sx={{ color: colors.green, fontSize: '1rem', flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: colors.gray600, fontSize: '0.8rem' }}>{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      component={Link}
                      to={service.link || '/contact?action=quote'}
                      fullWidth
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        bgcolor: colors.green,
                        color: 'white',
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': { bgcolor: colors.greenDark },
                      }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center" mt={3}>
            <Button
              variant="outlined"
              component={Link}
              to="/services"
              endIcon={<ArrowForwardIcon />}
              size="medium"
              sx={{
                borderColor: colors.blueBlack,
                color: colors.blueBlack,
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                '&:hover': { borderColor: colors.green, color: colors.green },
              }}
            >
              View All Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Portfolio teaser — 3-up grid (images from homePageMedia; replace via CMS) */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label="OUR PORTFOLIO"
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
              variant="h2"
              sx={{
                mt: 1.5,
                mb: 2,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '1.65rem', sm: '1.85rem', md: '2.25rem' },
                lineHeight: 1.2,
              }}
            >
              Projects That Power Ghana
            </Typography>
            <Typography variant="body1" sx={{ color: colors.gray600, maxWidth: 560, mx: 'auto', fontWeight: 400, fontSize: { xs: '0.95rem', md: '1rem' }, lineHeight: 1.65 }}>
              Explore our completed installations across residential, commercial, and industrial sectors.
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ mb: 3 }}>
            {homePortfolioPreview.map((project) => (
              <Grid item xs={12} sm={4} key={project.title}>
                <Card
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${colors.gray200}`,
                    height: '100%',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 28px rgba(0,0,0,0.1)' },
                  }}
                >
                  <CardActionArea component={Link} to="/portfolio" sx={{ alignItems: 'stretch', height: '100%', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={project.image}
                      alt={project.alt}
                      loading="lazy"
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2, width: '100%', textAlign: 'left' }}>
                      <Chip label={project.category} size="small" sx={{ mb: 1, fontSize: '0.65rem', height: 22, bgcolor: colors.greenLight, color: colors.blueBlack }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.blueBlack, fontSize: '0.95rem', lineHeight: 1.35 }}>
                        {project.title}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              size="medium"
              component={Link}
              to="/portfolio"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: colors.blueBlack,
                color: 'white',
                px: 4,
                py: 1.25,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { bgcolor: colors.blueBlackLight },
              }}
            >
              View Portfolio
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Process — horizontal step flow */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label="OUR PROCESS"
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
              variant="h2"
              sx={{
                mt: 1.5,
                mb: 0,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '1.65rem', sm: '1.85rem', md: '2.25rem' },
                lineHeight: 1.2,
              }}
            >
              Simple 5-Step Installation Process
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 2, md: 2.5 },
              justifyContent: 'center',
            }}
          >
            {[
              { step: '01', title: 'Free Consultation', desc: 'Site assessment and energy needs analysis' },
              { step: '02', title: 'Custom Design', desc: 'Tailored system design for your property' },
              { step: '03', title: 'Equipment Selection', desc: 'Choose from premium solar equipment' },
              { step: '04', title: 'Professional Installation', desc: 'Expert installation by certified technicians' },
              { step: '05', title: 'Activation & Support', desc: 'System activation and ongoing maintenance' },
            ].map((item, index) => (
              <Box
                key={index}
                textAlign="center"
                sx={{
                  flex: '1 1 140px',
                  maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(20% - 16px)' },
                  minWidth: { xs: '100%', sm: '200px', md: '160px' },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 56, md: 64 },
                    height: { xs: 56, md: 64 },
                    borderRadius: '50%',
                    bgcolor: colors.green,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 800,
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700, color: colors.blueBlack, fontSize: '0.95rem' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.gray600, fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box id="testimonials" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label="CLIENT TESTIMONIALS"
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
              variant="h2"
              sx={{
                mt: 1.5,
                mb: 0,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '1.65rem', sm: '1.85rem', md: '2.25rem' },
                lineHeight: 1.2,
              }}
            >
              Trusted by Ghanaians Across the Country
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[
              { name: 'Kwame Asante', location: 'Accra, Ghana', rating: 5, text: 'Energy Precisions transformed our home with a complete solar system. Our electricity bills dropped by 85% and we have reliable power 24/7. The installation was professional and the team was excellent.', role: 'Homeowner' },
              { name: 'Ama Osei', location: 'Kumasi, Ghana', rating: 5, text: 'As a business owner, switching to solar was the best decision. Energy Precisions provided a custom commercial system that pays for itself. Their after-sales support is outstanding.', role: 'Business Owner' },
              { name: 'David Mensah', location: 'Tamale, Ghana', rating: 5, text: 'The quality of equipment and installation exceeded our expectations. We\'ve had zero issues in 2 years. Highly recommend Energy Precisions for anyone considering solar in Ghana.', role: 'Factory Manager' },
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 2,
                    border: `1px solid ${colors.gray200}`,
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 10px 28px rgba(0,0,0,0.07)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box display="flex" gap={0.5} mb={2}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#fbbf24', fontSize: '1.15rem' }} />
                    ))}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.gray600,
                      fontStyle: 'italic',
                      mb: 2,
                      lineHeight: 1.65,
                      fontSize: '0.9rem',
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: colors.green,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.blueBlack, fontSize: '0.95rem' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.gray600, display: 'block' }}>{testimonial.role}</Typography>
                      <Typography variant="caption" sx={{ color: colors.gray400, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <LocationIcon sx={{ fontSize: '0.85rem' }} />
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Closing CTA */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 50%, rgba(0, 230, 118, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 800,
                fontSize: { xs: '1.65rem', sm: '1.9rem', md: '2.2rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Ready to Go Solar in Ghana?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 520,
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.65,
                fontSize: { xs: '0.95rem', md: '1rem' },
              }}
            >
              Join thousands of satisfied customers across Ghana who have made the switch to clean,
              affordable solar energy. Get your free quote today.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" alignItems="center">
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
                  py: 1.25,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { bgcolor: colors.greenDark },
                }}
              >
                Get Free Consultation
              </Button>
              <Button
                variant="outlined"
                size="medium"
                component={Link}
                to="/shop"
                sx={{
                  borderColor: 'rgba(255,255,255,0.55)',
                  borderWidth: 1.5,
                  color: 'white',
                  px: 3.5,
                  py: 1.25,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { borderColor: colors.green, bgcolor: 'rgba(0, 230, 118, 0.08)' },
                }}
              >
                Browse Products
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Factory as FactoryIcon,
  BatteryChargingFull as BatteryIcon,
  SolarPower as SolarPowerIcon,
  Engineering as EngineeringIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { servicesPageImages } from '../../data/homePageMedia';
import api from '../../services/api';

const Services: React.FC = () => {
  const { pathname } = useLocation();
  const [servicesHeroBg, setServicesHeroBg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Record<string, string>>('/content/settings/public')
      .then((res) => {
        const u = res.data?.services_hero_image?.trim();
        if (u && !cancelled) setServicesHeroBg(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const premiumServices = [
    {
      icon: <HomeIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Residential Solar Installation',
      description: 'Complete home solar systems designed for Ghanaian families. Reduce electricity bills by up to 90% with reliable, grid-tied or off-grid solutions.',
      features: [
        'Grid-tied & Off-grid Systems',
        'Battery Backup Solutions',
        'Smart Energy Monitoring',
        'Professional Installation',
        '10-Year Warranty',
        'Maintenance Support',
      ],
      image: servicesPageImages.residential,
      color: colors.green,
    },
    {
      icon: <BusinessIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Commercial Solar Installation',
      description: 'Large-scale solar solutions for businesses, offices, and commercial buildings. Maximize ROI with custom-designed systems.',
      features: [
        'Custom System Design',
        'ROI Analysis & Planning',
        'Minimal Business Disruption',
        'Long-term Cost Savings',
        'Scalable Solutions',
        '24/7 Monitoring',
      ],
      image: servicesPageImages.commercial,
      color: colors.blueBlack,
    },
    {
      icon: <FactoryIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Industrial Solar Solutions',
      description: 'Heavy-duty solar systems for factories and industrial facilities. Power your operations with reliable, cost-effective solar energy.',
      features: [
        'High-Capacity Systems',
        'Industrial-Grade Equipment',
        'Custom Engineering',
        '24/7 System Monitoring',
        'Dedicated Support Team',
        'Energy Management',
      ],
      image: servicesPageImages.industrial,
      color: colors.green,
    },
    {
      icon: <BatteryIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Battery Storage Solutions',
      description: 'Advanced battery storage systems for energy independence. Store solar energy for use during power outages and peak hours.',
      features: [
        'LiFePO4 Battery Technology',
        'Long Lifespan (10+ years)',
        'Fast Charging',
        'Smart Management Systems',
        'Backup Power Solutions',
        'Grid Independence',
      ],
      image: servicesPageImages.battery,
      color: colors.blueBlack,
    },
    {
      icon: <SolarPowerIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'Solar Energy Consultation',
      description: 'Expert consultation to help you choose the right solar solution. Free site assessments and energy audits for your property.',
      features: [
        'Free Site Assessment',
        'Energy Needs Analysis',
        'Custom System Design',
        'ROI Calculations',
        'Financing Options',
        'Government Incentive Guidance',
      ],
      image: servicesPageImages.consultation,
      color: colors.green,
    },
    {
      icon: <EngineeringIcon sx={{ fontSize: '2.25rem' }} />,
      title: 'System Maintenance & Monitoring',
      description: 'Ongoing maintenance and monitoring services to ensure your solar system operates at peak efficiency for years to come.',
      features: [
        'Regular Maintenance Checks',
        'Performance Monitoring',
        'Remote System Monitoring',
        'Quick Response Repairs',
        'Cleaning Services',
        'Annual System Inspections',
      ],
      image: servicesPageImages.maintenance,
      color: colors.blueBlack,
    },
  ];

  return (
    <Box>
      <Seo
        title="Solar Services Ghana | Residential, Commercial & Industrial"
        description="Residential, commercial, industrial and agricultural solar in Ghana — design, installation, battery storage, monitoring and maintenance from Energy Precisions."
        path={pathname}
      />
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: colors.blueBlack,
          color: 'white',
          py: { xs: 5, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          ...(servicesHeroBg
            ? {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(rgba(10, 14, 23, 0.85), rgba(10, 14, 23, 0.92)), url(${JSON.stringify(servicesHeroBg)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                },
              }
            : {}),
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" maxWidth={720} mx="auto">
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
              Complete Solar Solutions for Ghana
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.88)',
                lineHeight: 1.65,
                fontWeight: 400,
                fontSize: { xs: '0.95rem', md: '1rem' },
              }}
            >
              From premium equipment sales to expert installation and ongoing maintenance, 
              we provide end-to-end solar energy solutions tailored for Ghana's unique energy needs.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Services Grid */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {premiumServices.map((service, index) => (
              <Grid item xs={12} md={6} key={index}>
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
                  <Box
                    sx={{
                      height: { xs: 170, sm: 190 },
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: colors.gray200,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={service.image}
                      alt={service.title}
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                        '&:hover': { transform: 'scale(1.03)' },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      {service.icon}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, md: 3 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1.25,
                        fontWeight: 700,
                        color: colors.blueBlack,
                        fontSize: '1.1rem',
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        color: colors.gray600,
                        lineHeight: 1.65,
                        fontSize: '0.9rem',
                      }}
                    >
                      {service.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.25, fontWeight: 700, color: colors.blueNavy }}>
                        What's Included:
                      </Typography>
                      <Grid container spacing={1}>
                        {service.features.map((feature, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CheckCircleIcon sx={{ color: service.color, fontSize: '1.2rem' }} />
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                {feature}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/contact?action=quote"
                      fullWidth
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        bgcolor: service.color as string,
                        color: 'white',
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        '&:hover': {
                          bgcolor: service.color === colors.green ? colors.greenDark : colors.blueBlackLight,
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      Request Quote
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Installation Process */}
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
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 1.5,
                mb: 1.5,
                fontWeight: 800,
                color: colors.blueNavy,
                fontSize: { xs: '1.65rem', md: '2.1rem' },
                lineHeight: 1.2,
              }}
            >
              Simple 5-Step Installation Process
            </Typography>
            <Typography variant="body1" sx={{ color: colors.gray600, fontWeight: 400, maxWidth: 560, mx: 'auto', fontSize: '0.95rem' }}>
              From consultation to activation, we make going solar simple and stress-free
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 2 }, justifyContent: 'center' }}>
            {[
              {
                step: '01',
                title: 'Free Consultation',
                desc: 'Site assessment and energy needs analysis. We visit your property to understand your requirements.',
                icon: <SupportIcon />,
              },
              {
                step: '02',
                title: 'Custom Design',
                desc: 'Our engineers create a tailored system design optimized for your property and energy needs.',
                icon: <EngineeringIcon />,
              },
              {
                step: '03',
                title: 'Equipment Selection',
                desc: 'Choose from our premium selection of solar panels, inverters, and batteries with expert guidance.',
                icon: <SolarPowerIcon />,
              },
              {
                step: '04',
                title: 'Professional Installation',
                desc: 'Certified technicians install your system with minimal disruption to your daily activities.',
                icon: <CheckCircleIcon />,
              },
              {
                step: '05',
                title: 'Activation & Support',
                desc: 'System activation, training, and ongoing maintenance support to ensure optimal performance.',
                icon: <BatteryIcon />,
              },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  flex: '1 1 200px',
                  maxWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(20% - 13px)' },
                  minWidth: { xs: '100%', sm: '220px', md: '160px' },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${colors.gray200}`,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      borderColor: colors.green,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: colors.green,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Box sx={{ color: colors.blueNavy, mb: 1.25, fontSize: '1.85rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, color: colors.blueNavy, fontSize: '0.95rem' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray600, lineHeight: 1.55, fontSize: '0.8rem' }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Guarantees Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label="OUR GUARANTEES"
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
              variant="h2"
              sx={{
                mt: 1.5,
                mb: 0,
                fontWeight: 800,
                color: colors.blueNavy,
                fontSize: { xs: '1.65rem', md: '2.1rem' },
                lineHeight: 1.2,
              }}
            >
              Your Investment is Protected
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {[
              {
                title: '10-Year Installation Warranty',
                desc: 'Comprehensive warranty covering all installation work and system performance.',
                icon: <CheckCircleIcon />,
              },
              {
                title: '25-Year Panel Warranty',
                desc: 'Manufacturer warranty on all solar panels, ensuring long-term performance.',
                icon: <SolarPowerIcon />,
              },
              {
                title: 'Free Maintenance (First Year)',
                desc: 'Complimentary maintenance and system checks for the first year after installation.',
                icon: <SupportIcon />,
              },
              {
                title: 'Performance Guarantee',
                desc: 'We guarantee your system will meet or exceed projected energy generation.',
                icon: <BatteryIcon />,
              },
            ].map((guarantee, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 2,
                    textAlign: 'center',
                    border: `1px solid ${colors.green}`,
                    bgcolor: colors.offWhite,
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                    },
                  }}
                >
                  <Box sx={{ color: colors.green, fontSize: '2.25rem', mb: 1.5 }}>{guarantee.icon}</Box>
                  <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 700, color: colors.blueNavy, fontSize: '0.95rem' }}>
                    {guarantee.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray600, lineHeight: 1.6, fontSize: '0.85rem' }}>
                    {guarantee.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 800,
                fontSize: { xs: '1.65rem', md: '2.1rem' },
                lineHeight: 1.2,
              }}
            >
              Ready to Start Your Solar Journey?
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
                fontSize: '0.95rem',
              }}
            >
              Get a free consultation and quote today. Our team will assess your needs 
              and design the perfect solar solution for your home or business.
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
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2.5 }}
            >
              <Button
                component={Link}
                to="/solar-estimate"
                variant="text"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { color: colors.green, bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Solar size estimator
              </Button>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', display: { xs: 'none', sm: 'block' } }}>
                ·
              </Typography>
              <Button
                component={Link}
                to="/load-calculator"
                variant="text"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { color: colors.green, bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Appliance load calculator
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Services;

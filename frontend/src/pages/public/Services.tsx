import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Chip,
  Divider,
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
import { Link } from 'react-router-dom';
import websiteContent from '../../data/extracted_content.json';

const serviceImages: { [key: string]: string } = {
  'Residential Solar Installation': '/website_images/post38.png',
  'Battery Storage Solutions': '/website_images/post39.png',
  'Commercial Solar Installation': '/website_images/post32-min-394x474.webp',
  'Solar Energy Consultation': '/website_images/post33-min-394x474.webp',
  'Energy Efficiency Audits and System Monitoring': '/website_images/image-394x474.webp',
  'Product Sales and Expert Consultation': '/website_images/ChatGPT.png',
};

const Services: React.FC = () => {
  const content = websiteContent;

  const premiumServices = [
    {
      icon: <HomeIcon sx={{ fontSize: '3rem' }} />,
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
      image: '/website_images/post38.png',
      color: '#00E676',
    },
    {
      icon: <BusinessIcon sx={{ fontSize: '3rem' }} />,
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
      image: '/website_images/post32-min-394x474.webp',
      color: '#1a4d7a',
    },
    {
      icon: <FactoryIcon sx={{ fontSize: '3rem' }} />,
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
      image: '/website_images/post39.png',
      color: '#00E676',
    },
    {
      icon: <BatteryIcon sx={{ fontSize: '3rem' }} />,
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
      image: '/website_images/post39.png',
      color: '#1a4d7a',
    },
    {
      icon: <SolarPowerIcon sx={{ fontSize: '3rem' }} />,
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
      image: '/website_images/post33-min-394x474.webp',
      color: '#00E676',
    },
    {
      icon: <EngineeringIcon sx={{ fontSize: '3rem' }} />,
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
      image: '/website_images/image-394x474.webp',
      color: '#1a4d7a',
    },
  ];

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
          <Box textAlign="center" maxWidth="900px" mx="auto">
            <Chip
              label="OUR SERVICES"
              sx={{
                bgcolor: '#00E676',
                color: 'white',
                fontWeight: 'bold',
                mb: 3,
                px: 2,
                py: 0.5,
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
              Complete Solar Solutions for Ghana
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.8,
                fontWeight: 400,
              }}
            >
              From premium equipment sales to expert installation and ongoing maintenance, 
              we provide end-to-end solar energy solutions tailored for Ghana's unique energy needs.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Services Grid */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {premiumServices.map((service, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                      borderColor: service.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: service.color,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <Box>{service.icon}</Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        mb: 2,
                        fontWeight: 700,
                        color: '#1a4d7a',
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        color: '#666',
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                      }}
                    >
                      {service.description}
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a4d7a' }}>
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
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: service.color,
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: service.color === '#00E676' ? '#00C85F' : '#0d3a5a',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${service.color}40`,
                        },
                        transition: 'all 0.3s ease',
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
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={8}>
            <Chip
              label="OUR PROCESS"
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
              Simple 5-Step Installation Process
            </Typography>
            <Typography variant="h6" sx={{ color: '#666', fontWeight: 400, maxWidth: '700px', mx: 'auto' }}>
              From consultation to activation, we make going solar simple and stress-free
            </Typography>
          </Box>

          <Grid container spacing={4}>
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
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#00E676',
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: '#00E676',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.step}
                  </Box>
                  <Box sx={{ color: '#1a4d7a', mb: 2, fontSize: '2.5rem' }}>{item.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1.5,
                      fontWeight: 700,
                      color: '#1a4d7a',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Guarantees Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={8}>
            <Chip
              label="OUR GUARANTEES"
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
              Your Investment is Protected
            </Typography>
          </Box>

          <Grid container spacing={4}>
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
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    border: '2px solid #00E676',
                    bgcolor: '#f8f9fa',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ color: '#00E676', fontSize: '3rem', mb: 2 }}>{guarantee.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: '#1a4d7a',
                    }}
                  >
                    {guarantee.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
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
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #1a4d7a 0%, #0d3a5a 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Ready to Start Your Solar Journey?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '700px',
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Get a free consultation and quote today. Our team will assess your needs 
              and design the perfect solar solution for your home or business.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/contact?action=quote"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#00E676',
                color: 'white',
                px: 5,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { bgcolor: '#00C85F' },
              }}
            >
              Get Free Consultation
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Services;

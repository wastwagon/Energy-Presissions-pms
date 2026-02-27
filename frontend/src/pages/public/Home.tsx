import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
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
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

const Home: React.FC = () => {
  return (
    <Box>
      {/* Hero - Premium */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 50%, ${colors.blueNavy} 100%)`,
          color: 'white',
          py: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: { md: '90vh' },
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
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Ghana's Leading Solar Energy Solutions"
                sx={{
                  bgcolor: colors.green,
                  color: 'white',
                  fontWeight: 700,
                  mb: 3,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.85rem',
                  letterSpacing: 0.5,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.6rem', md: '4rem', lg: '5rem' },
                  fontWeight: 800,
                  mb: 3,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                }}
              >
                Powering Ghana's Future with{' '}
                <Box component="span" sx={{ color: colors.green }}>
                  Clean Energy
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1.8,
                  fontWeight: 400,
                  maxWidth: '90%',
                }}
              >
                Complete solar solutions from premium equipment sales to expert installation. 
                Trusted by thousands of homes and businesses across Ghana.
              </Typography>
              
              <Stack direction="row" spacing={5} sx={{ mb: 4, flexWrap: 'wrap', gap: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: colors.green }}>
                    500+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Installations
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: colors.green }}>
                    10+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Years Experience
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: colors.green }}>
                    98%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Customer Satisfaction
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
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
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: `0 8px 24px ${colors.green}40`,
                    '&:hover': { 
                      bgcolor: colors.greenDark,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${colors.green}50`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Free Quote
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/shop"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    borderWidth: 2,
                    color: 'white',
                    px: 4,
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { 
                      borderColor: colors.green,
                      bgcolor: colors.greenLight,
                      borderWidth: 2,
                    },
                    transition: 'all 0.3s ease',
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
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                }}
              >
                <Box
                  component="img"
                  src="/website_images/remove-bg3.png"
                  alt="Energy Precisions Solar Installation"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Bar */}
      <Box sx={{ bgcolor: colors.gray100, py: 4, borderBottom: `1px solid ${colors.gray200}` }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            {[
              { icon: <VerifiedIcon />, text: 'Certified Installers' },
              { icon: <SecurityIcon />, text: '10-Year Warranty' },
              { icon: <ShippingIcon />, text: 'Free Delivery in Ghana' },
              { icon: <SupportIcon />, text: '24/7 Support' },
            ].map((item, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                  <Box sx={{ color: colors.green, fontSize: '2.2rem' }}>{item.icon}</Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: colors.blueBlack }}>
                    {item.text}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={10}>
            <Chip
              label="WHY CHOOSE ENERGY PRECISIONS"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                fontWeight: 700,
                mb: 2,
                px: 2,
                py: 0.5,
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Ghana's Most Trusted Solar Partner
            </Typography>
            <Typography variant="h6" sx={{ color: colors.gray600, maxWidth: 680, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
              From premium equipment to expert installation, we deliver complete solar solutions 
              that power homes and businesses across Ghana.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { icon: <PremiumIcon sx={{ fontSize: '2.8rem' }} />, title: 'Premium Quality Equipment', description: 'We source only the finest solar panels, inverters, and batteries from leading global manufacturers. Every product is tested and certified for Ghana\'s climate.', color: colors.green },
              { icon: <SpeedIcon sx={{ fontSize: '2.8rem' }} />, title: 'Expert Installation Team', description: 'Our certified technicians have installed over 500 solar systems across Ghana. Professional installation ensures maximum efficiency and longevity.', color: colors.blueBlack },
              { icon: <SecurityIcon sx={{ fontSize: '2.8rem' }} />, title: 'Comprehensive Warranty', description: '10-year warranty on installations, 25-year panel warranty, and lifetime support. Your investment is protected with our comprehensive coverage.', color: colors.green },
              { icon: <SupportIcon sx={{ fontSize: '2.8rem' }} />, title: 'Local Support in Ghana', description: 'Based in Accra, we provide fast response times and local expertise. Our team understands Ghana\'s energy needs and regulations.', color: colors.blueBlack },
              { icon: <TrendingUpIcon sx={{ fontSize: '2.8rem' }} />, title: 'Proven Track Record', description: 'Trusted by residential, commercial, and industrial clients across Ghana. See our case studies and customer testimonials.', color: colors.green },
              { icon: <EcoIcon sx={{ fontSize: '2.8rem' }} />, title: 'Sustainable Future', description: 'Join thousands of Ghanaians reducing electricity costs and carbon footprint. Make a positive impact on Ghana\'s energy future.', color: colors.blueBlack },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 4,
                    border: `1px solid ${colors.gray200}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: colors.blueBlack }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.gray600, lineHeight: 1.8 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section - With Images */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={10}>
            <Chip
              label="OUR SERVICES"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                fontWeight: 700,
                mb: 2,
                px: 2,
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
              }}
            >
              Complete Solar Solutions for Ghana
            </Typography>
            <Typography variant="h6" sx={{ color: colors.gray600, maxWidth: 680, mx: 'auto', fontWeight: 400 }}>
              From equipment sales to full installation, we provide end-to-end solar energy solutions 
              tailored for Ghana's unique energy needs.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { icon: <HomeIcon />, title: 'Residential Solar', description: 'Complete home solar systems with battery backup. Reduce your electricity bills by up to 90% with our premium residential solutions.', features: ['Grid-tied & Off-grid Systems', 'Battery Storage Options', 'Smart Monitoring', 'Maintenance Support'], image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600', link: '/services/residential' },
              { icon: <BusinessIcon />, title: 'Commercial Solar', description: 'Large-scale solar installations for businesses, offices, and commercial buildings. Maximize ROI with our commercial solar solutions.', features: ['Custom System Design', 'ROI Analysis', 'Minimal Business Disruption', 'Long-term Savings'], image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=600', link: '/services/commercial' },
              { icon: <FactoryIcon />, title: 'Industrial Solar', description: 'Heavy-duty solar systems for factories and industrial facilities. Power your operations with reliable, cost-effective solar energy.', features: ['High-Capacity Systems', 'Industrial-Grade Equipment', 'Custom Engineering', '24/7 Monitoring'], image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600', link: '/services/industrial' },
            ].map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: `1px solid ${colors.gray200}`,
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 56px rgba(0,0,0,0.12)',
                      borderColor: colors.green,
                    },
                  }}
                >
                  <Box sx={{ height: 220, overflow: 'hidden', bgcolor: colors.gray200 }}>
                    <CardMedia
                      component="img"
                      image={service.image}
                      alt={service.title}
                      loading="lazy"
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ color: colors.green, fontSize: '2.5rem', mb: 2 }}>{service.icon}</Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: colors.blueBlack }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: colors.gray600, lineHeight: 1.8 }}>
                      {service.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {service.features.map((feature, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1} mb={1.5}>
                          <CheckCircleIcon sx={{ color: colors.green, fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ color: colors.gray600 }}>{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      component={Link}
                      to={service.link || '/contact?action=quote'}
                      fullWidth
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: colors.green,
                        color: 'white',
                        py: 1.5,
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
          <Box textAlign="center" mt={4}>
            <Button
              variant="outlined"
              component={Link}
              to="/services"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderColor: colors.blueBlack,
                color: colors.blueBlack,
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                '&:hover': { borderColor: colors.green, color: colors.green },
              }}
            >
              View All Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Portfolio Preview */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={8}>
            <Chip
              label="OUR PORTFOLIO"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                fontWeight: 700,
                mb: 2,
                px: 2,
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
              }}
            >
              Projects That Power Ghana
            </Typography>
            <Typography variant="h6" sx={{ color: colors.gray600, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
              Explore our completed installations across residential, commercial, and industrial sectors.
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/portfolio"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: colors.blueBlack,
                color: 'white',
                px: 5,
                py: 1.8,
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

      {/* Process */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={10}>
            <Chip
              label="OUR PROCESS"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                fontWeight: 700,
                mb: 2,
                px: 2,
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
              }}
            >
              Simple 5-Step Installation Process
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { step: '01', title: 'Free Consultation', desc: 'Site assessment and energy needs analysis' },
              { step: '02', title: 'Custom Design', desc: 'Tailored system design for your property' },
              { step: '03', title: 'Equipment Selection', desc: 'Choose from premium solar equipment' },
              { step: '04', title: 'Professional Installation', desc: 'Expert installation by certified technicians' },
              { step: '05', title: 'Activation & Support', desc: 'System activation and ongoing maintenance' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: colors.green,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: '1.5rem',
                      fontWeight: 800,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: colors.blueBlack }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray600 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box id="testimonials" sx={{ py: { xs: 10, md: 14 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={10}>
            <Chip
              label="CLIENT TESTIMONIALS"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                fontWeight: 700,
                mb: 2,
                px: 2,
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 3,
                fontWeight: 800,
                color: colors.blueBlack,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
              }}
            >
              Trusted by Ghanaians Across the Country
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { name: 'Kwame Asante', location: 'Accra, Ghana', rating: 5, text: 'Energy Precisions transformed our home with a complete solar system. Our electricity bills dropped by 85% and we have reliable power 24/7. The installation was professional and the team was excellent.', role: 'Homeowner' },
              { name: 'Ama Osei', location: 'Kumasi, Ghana', rating: 5, text: 'As a business owner, switching to solar was the best decision. Energy Precisions provided a custom commercial system that pays for itself. Their after-sales support is outstanding.', role: 'Business Owner' },
              { name: 'David Mensah', location: 'Tamale, Ghana', rating: 5, text: 'The quality of equipment and installation exceeded our expectations. We\'ve had zero issues in 2 years. Highly recommend Energy Precisions for anyone considering solar in Ghana.', role: 'Factory Manager' },
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${colors.gray200}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box display="flex" gap={0.5} mb={3}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#fbbf24', fontSize: '1.5rem' }} />
                    ))}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.gray600,
                      fontStyle: 'italic',
                      mb: 3,
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" alignItems="center" gap={2}>
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
                        fontWeight: 700,
                        fontSize: '1.25rem',
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.blueBlack }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.gray600 }}>{testimonial.role}</Typography>
                      <Typography variant="body2" sx={{ color: colors.gray400, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <LocationIcon sx={{ fontSize: '1rem' }} />
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

      {/* CTA */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontWeight: 800,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Go Solar in Ghana?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                color: 'rgba(255,255,255,0.92)',
                maxWidth: 640,
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              Join thousands of satisfied customers across Ghana who have made the switch to clean, 
              affordable solar energy. Get your free quote today.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/contact?action=quote"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: colors.green,
                  color: 'white',
                  px: 5,
                  py: 1.8,
                  fontSize: '1rem',
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
                size="large"
                component={Link}
                to="/shop"
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)',
                  borderWidth: 2,
                  color: 'white',
                  px: 5,
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { borderColor: colors.green, bgcolor: colors.greenLight },
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

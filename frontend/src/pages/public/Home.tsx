import React, { useRef } from 'react';
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
  IconButton,
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { homePageImages } from '../../data/homePageMedia';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import TrustStrip from '../../components/public/TrustStrip';
import HomeHero from '../../components/public/HomeHero';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';

const whyChooseIcons = [
  <PremiumIcon sx={{ fontSize: '2.25rem' }} />,
  <SpeedIcon sx={{ fontSize: '2.25rem' }} />,
  <SecurityIcon sx={{ fontSize: '2.25rem' }} />,
  <SupportIcon sx={{ fontSize: '2.25rem' }} />,
  <TrendingUpIcon sx={{ fontSize: '2.25rem' }} />,
  <EcoIcon sx={{ fontSize: '2.25rem' }} />,
];

const whyChooseColors = [colors.green, colors.blueBlack, colors.green, colors.blueBlack, colors.green, colors.blueBlack];

const trustBarIcons = [<VerifiedIcon />, <SecurityIcon />, <ShippingIcon />, <SupportIcon />];
const homeServiceIcons = [<HomeIcon />, <BusinessIcon />, <FactoryIcon />, <AgricultureIcon />];

const Home: React.FC = () => {
  const { sections } = useCmsPage('home');
  const seo = resolveCmsSeo(sections, {
    title: 'Energy Precisions | Ghana Energy Transition · Solar & Hybrid Power',
    description:
      "Partner in Ghana's energy transition: hybrid solar, lithium storage, turnkey installation and lifecycle support for homes, business and industry. Accra-based, nationwide.",
  });
  const whyScrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box>
      <Seo title={seo.title} description={seo.description} path="/" />
      <HomeHero />

      <TrustStrip variant="light" />

      {/* Trust Bar — compact strip (Webflow-style social proof) */}
      <Box sx={{ bgcolor: colors.gray100, py: { xs: 2.5, md: 3 }, borderBottom: `1px solid ${colors.gray200}` }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center" justifyContent="center">
            {(sections.trust_bar?.items || []).map((item, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                  <Box sx={{ color: colors.green, fontSize: { xs: '1.65rem', md: '1.85rem' }, flexShrink: 0 }}>
                    {trustBarIcons[index]}
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
              label={sections.why_choose?.badge}
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
              {sections.why_choose?.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: colors.gray600, maxWidth: 640, mx: 'auto', fontWeight: 400, lineHeight: 1.65, fontSize: { xs: '0.95rem', md: '1rem' } }}
            >
              {sections.why_choose?.subtitle}
            </Typography>
          </Box>

          <Box sx={{ position: 'relative', mx: { xs: -1, sm: 0 } }}>
            <IconButton
              aria-label="Scroll reasons left"
              onClick={() => {
                const el = whyScrollRef.current;
                if (!el) return;
                el.scrollBy({ left: -Math.min(el.clientWidth * 0.92, 400), behavior: 'smooth' });
              }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                left: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(10,14,23,0.12)',
                border: `1px solid ${colors.gray200}`,
                '&:hover': { bgcolor: colors.offWhite },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="Scroll reasons right"
              onClick={() => {
                const el = whyScrollRef.current;
                if (!el) return;
                el.scrollBy({ left: Math.min(el.clientWidth * 0.92, 400), behavior: 'smooth' });
              }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                right: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(10,14,23,0.12)',
                border: `1px solid ${colors.gray200}`,
                '&:hover': { bgcolor: colors.offWhite },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Box
              ref={whyScrollRef}
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                pb: 1.5,
                px: { xs: 0.5, md: 0 },
                scrollBehavior: 'smooth',
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(10,14,23,0.2)',
                  borderRadius: 999,
                },
              }}
            >
              {(sections.why_choose?.features || []).map((feature, index) => (
                <Card
                  key={index}
                  sx={{
                    flex: '0 0 min(100%, 340px)',
                    maxWidth: { xs: 'min(100%, 340px)', sm: 'min(100%, 360px)' },
                    scrollSnapAlign: 'start',
                    height: '100%',
                    p: { xs: 2.5, md: 3 },
                    border: `1px solid ${colors.gray200}`,
                    borderRadius: 2,
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': {
                      borderColor: colors.gray200,
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Box sx={{ color: whyChooseColors[index] ?? colors.green, mb: 1.5 }}>{whyChooseIcons[index]}</Box>
                  <Typography variant="h6" sx={{ mb: 1.25, fontWeight: 700, color: colors.blueBlack, fontSize: '1.05rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray600, lineHeight: 1.65 }}>
                    {feature.description}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Services — image-led cards (swap URLs in data/homePageMedia.ts for CMS) */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label={sections.services_section?.badge}
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
              {sections.services_section?.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: colors.gray600, maxWidth: 640, mx: 'auto', fontWeight: 400, fontSize: { xs: '0.95rem', md: '1rem' }, lineHeight: 1.65 }}
            >
              {sections.services_section?.subtitle}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {(sections.service_cards?.items || []).map((service, index) => (
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
                      image={resolveMediaUrl(service.image) || homePageImages.services.residential}
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
                    <Box sx={{ color: colors.green, fontSize: '2rem', mb: 1.25 }}>{homeServiceIcons[index]}</Box>
                    <Typography variant="h6" sx={{ mb: 1.25, fontWeight: 700, color: colors.blueBlack, fontSize: '1.05rem' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: colors.gray600, lineHeight: 1.65 }}>
                      {service.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {(service.features || []).map((feature, idx) => (
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
                      {service.button_text || 'Learn More'}
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
              to={sections.service_cards?.view_all_link || '/services'}
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
              {sections.service_cards?.view_all_text || 'View All Services'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Portfolio teaser — 3-up grid (images from homePageMedia; replace via CMS) */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label={sections.portfolio?.badge}
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
              {sections.portfolio?.title}
            </Typography>
            <Typography variant="body1" sx={{ color: colors.gray600, maxWidth: 560, mx: 'auto', fontWeight: 400, fontSize: { xs: '0.95rem', md: '1rem' }, lineHeight: 1.65 }}>
              {sections.portfolio?.subtitle}
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ mb: 3 }}>
            {(sections.portfolio?.items || []).map((project) => (
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
                  <CardActionArea component={Link} to={project.link || '/portfolio'} sx={{ alignItems: 'stretch', height: '100%', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={resolveMediaUrl(project.image)}
                      alt={project.alt}
                      loading="lazy"
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2, width: '100%', textAlign: 'left' }}>
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
              to={sections.portfolio?.cta_link || '/portfolio'}
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
              {sections.portfolio?.cta_text || 'View Portfolio'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Process — horizontal step flow */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={{ xs: 4, md: 5 }}>
            <Chip
              label={sections.process?.badge}
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
              {sections.process?.title}
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
            {(sections.process?.steps || []).map((item, index) => (
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
              label={sections.testimonials?.badge}
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
              {sections.testimonials?.title}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {(sections.testimonials?.items || []).map((testimonial, index) => (
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
              {sections.closing_cta?.title}
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
              {sections.closing_cta?.subtitle}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" alignItems="center">
              <Button
                variant="contained"
                size="medium"
                component={Link}
                to={sections.closing_cta?.primary_cta_link || '/contact?action=quote'}
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
                {sections.closing_cta?.primary_cta_text}
              </Button>
              <Button
                variant="outlined"
                size="medium"
                component={Link}
                to={sections.closing_cta?.secondary_cta_link || '/shop'}
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
                {sections.closing_cta?.secondary_cta_text}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

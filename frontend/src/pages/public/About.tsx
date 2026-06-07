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
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { homePageImages } from '../../data/homePageMedia';
import api from '../../services/api';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import TrustStrip from '../../components/public/TrustStrip';
import PublicPageHero from '../../components/public/PublicPageHero';
import Link from '@mui/material/Link';
import { COMPANY } from '../../data/companyContact';

const About: React.FC = () => {
  const { sections } = useCmsPage('about');
  const seo = resolveCmsSeo(sections, {
    title: 'About Energy Precisions | Ghana Solar Company',
    description:
      "Ghana's premier solar energy company — turnkey solutions from design and installation to equipment and maintenance. Learn our story and values.",
  });
  const hero = sections.hero;
  const [aboutHero, setAboutHero] = useState<string>(hero.hero_image || homePageImages.hero);
  const whyScrollRef = React.useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const whyChooseIcons = [
    <LocationIcon sx={{ fontSize: '2.25rem' }} />,
    <BusinessIcon sx={{ fontSize: '2.25rem' }} />,
    <PeopleIcon sx={{ fontSize: '2.25rem' }} />,
    <SecurityIcon sx={{ fontSize: '2.25rem' }} />,
    <TrendingUpIcon sx={{ fontSize: '2.25rem' }} />,
    <EcoIcon sx={{ fontSize: '2.25rem' }} />,
  ];
  const whyChooseColors = [colors.green, colors.blueNavy, colors.green, colors.blueNavy, colors.green, colors.blueNavy];

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
    const cmsImage = hero.hero_image?.trim();
    if (cmsImage) {
      setAboutHero(cmsImage);
      return;
    }
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
  }, [hero.hero_image]);

  return (
    <Box>
      <Seo title={seo.title} description={seo.description} path="/about" />
      <PublicPageHero
        badge={hero.badge}
        headline={hero.headline}
        headlineHighlight={hero.headline_highlight}
        description={hero.description}
        backgroundImage={aboutHero}
      >
        {hero.stats?.length > 0 && (
          <Stack direction="row" spacing={{ xs: 2, sm: 3 }} flexWrap="wrap" useFlexGap>
            {hero.stats.map((s) => (
              <Box key={s.label}>
                <Typography sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1, fontSize: '1.25rem' }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </PublicPageHero>

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
                  {sections.mission_vision?.mission_title}
                </Typography>
                <Typography variant="body1" sx={{ color: colors.gray600, lineHeight: 1.8, fontSize: '1.1rem' }}>
                  {sections.mission_vision?.mission_text}
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
                  {sections.mission_vision?.vision_title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  {sections.mission_vision?.vision_text}
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
              {sections.why_choose?.title}
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
            {(sections.why_choose?.features || []).map((feature, index) => (
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
                      color: whyChooseColors[index] ?? colors.blueNavy,
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
                    {whyChooseIcons[index]}
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
                  <Typography variant="body1" sx={{ color: colors.gray600, lineHeight: 1.65, fontSize: '0.98rem' }}>
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
              label={sections.specialties?.badge}
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
              {sections.specialties?.title}
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
              {sections.specialties?.subtitle}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {(sections.specialties?.items || []).map((specialty, index) => (
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
              {sections.impact_stats?.title}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {(sections.impact_stats?.items || []).map((stat, index) => (
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
          bgcolor: colors.offWhite,
          backgroundImage: 'radial-gradient(circle at top left, rgba(0,230,118,0.07), transparent 38%)',
        }}
      >
        <Container maxWidth="xl">
          <Box textAlign="center" mb={6}>
            <Chip
              label={sections.visit_us?.badge}
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
              {sections.visit_us?.title}
            </Typography>
            <Typography variant="h6" sx={{ color: colors.gray600, fontWeight: 400 }}>
              {sections.visit_us?.subtitle}
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
                        {sections.visit_us?.location_title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.gray600 }}>
                        {sections.visit_us?.location_address || COMPANY.addressFull}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body1" sx={{ color: colors.gray600, lineHeight: 1.8 }}>
                      {sections.visit_us?.location_body}
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
                  {sections.visit_us?.cta_title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
                  {sections.visit_us?.cta_body}
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PhoneIcon sx={{ color: colors.green }} />
                    <Typography variant="body1">{sections.visit_us?.phone || COMPANY.phoneDisplay}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EmailIcon sx={{ color: colors.green }} />
                    <Link href={`mailto:${sections.visit_us?.email || COMPANY.emailPrimary}`} color="inherit" underline="hover">
                      {sections.visit_us?.email || COMPANY.emailPrimary}
                    </Link>
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

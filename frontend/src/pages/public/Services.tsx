import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  BatteryChargingFull as BatteryIcon,
  SolarPower as SolarPowerIcon,
  Engineering as EngineeringIcon,
  SupportAgent as SupportIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import PublicPageHero from '../../components/public/PublicPageHero';
import HomeSectionHeader from '../../components/public/HomeSectionHeader';
import api from '../../services/api';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const Services: React.FC = () => {
  const { pathname } = useLocation();
  const { sections } = useCmsPage('services');
  const seo = resolveCmsSeo(sections, {
    title: 'Solar Services Ghana | Residential, Commercial & Industrial',
    description:
      'Residential, commercial, industrial and agricultural solar in Ghana — design, installation, battery storage, monitoring and maintenance from Energy Precisions.',
  });
  const hero = sections.hero;
  const [servicesHeroBg, setServicesHeroBg] = useState<string | null>(null);
  const processScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cmsImage = hero.hero_image?.trim();
    if (cmsImage) {
      setServicesHeroBg(cmsImage);
      return;
    }
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
  }, [hero.hero_image]);

  const serviceCardColors = [colors.green, colors.blueBlack];
  const guaranteeIcons = [<CheckCircleIcon />, <SolarPowerIcon />, <SupportIcon />, <BatteryIcon />];
  const processStepIcons = [<SupportIcon />, <EngineeringIcon />, <SolarPowerIcon />, <CheckCircleIcon />, <BatteryIcon />];

  return (
    <Box>
      <Seo title={seo.title} description={seo.description} path={pathname} />
      <PublicPageHero
        badge={hero.badge}
        headline={hero.headline}
        headlineHighlight={hero.headline_highlight}
        description={hero.description}
        backgroundImage={servicesHeroBg}
      />

      {/* Services Grid */}
      <Box sx={{ py: { xs: 4, md: 7 }, bgcolor: homeUi.pageBg }}>
        <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {(sections.service_cards?.items || []).map((service, index) => {
              const cardColor = serviceCardColors[index % 2];
              return (
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
                      image={resolveMediaUrl(service.image)}
                      alt={service.title}
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                        '&:hover': { transform: 'scale(1.03)' },
                      }}
                    />
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
                        {(service.features || []).map((feature, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CheckCircleIcon sx={{ color: cardColor, fontSize: '1.2rem' }} />
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
                      to={service.link || '/contact?action=quote'}
                      fullWidth
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        bgcolor: cardColor,
                        color: 'white',
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        '&:hover': {
                          bgcolor: cardColor === colors.green ? colors.greenDark : colors.blueBlackLight,
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {service.button_text || 'Get a Quote'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Installation Process */}
      <Box sx={{ py: { xs: 4, md: 7 }, bgcolor: homeUi.cardBg }}>
        <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
          <HomeSectionHeader
            badge={sections.process?.badge}
            title={sections.process?.title}
            subtitle={sections.process?.subtitle}
            align="left"
            maxSubtitleWidth={520}
          />

          <Box sx={{ position: 'relative', mx: { xs: -0.5, sm: 0 } }}>
            <IconButton
              aria-label="Scroll installation steps left"
              onClick={() => {
                const el = processScrollRef.current;
                if (!el) return;
                el.scrollBy({ left: -Math.min(el.clientWidth * 0.85, 280), behavior: 'smooth' });
              }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                left: -8,
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
              aria-label="Scroll installation steps right"
              onClick={() => {
                const el = processScrollRef.current;
                if (!el) return;
                el.scrollBy({ left: Math.min(el.clientWidth * 0.85, 280), behavior: 'smooth' });
              }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                right: -8,
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
              ref={processScrollRef}
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                pb: 1,
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
              {(sections.process?.steps || []).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '0 0 min(100%, 260px)',
                    maxWidth: { xs: 'min(100%, 280px)', sm: 'min(100%, 240px)' },
                    scrollSnapAlign: 'start',
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
                    <Box sx={{ color: colors.blueNavy, mb: 1.25, fontSize: '1.85rem', display: 'flex', justifyContent: 'center' }}>{processStepIcons[index]}</Box>
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
          </Box>
        </Container>
      </Box>

      {/* Guarantees Section */}
      <Box sx={{ py: { xs: 4, md: 7 }, bgcolor: homeUi.pageBg }}>
        <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
          <HomeSectionHeader
            badge={sections.guarantees?.badge}
            title={sections.guarantees?.title}
            align="left"
          />

          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {(sections.guarantees?.items || []).map((guarantee, index) => (
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
                  <Box sx={{ color: colors.green, fontSize: '2.25rem', mb: 1.5 }}>{guaranteeIcons[index]}</Box>
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
          py: { xs: 4.5, md: 7 },
          bgcolor: colors.blueBlack,
          color: 'white',
        }}
      >
        <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
          <Box sx={{ maxWidth: 520 }}>
            <Typography
              variant="h2"
              sx={{
                ...homeUi.title,
                mb: 1.5,
                fontSize: { xs: '1.625rem', md: '2rem' },
                lineHeight: 1.2,
              }}
            >
              {sections.closing_cta?.title}
            </Typography>
            <Typography
              sx={{
                mb: 2.5,
                color: publicUi.hero.subtitle,
                maxWidth: 480,
                lineHeight: 1.6,
                fontSize: '0.9375rem',
              }}
            >
              {sections.closing_cta?.subtitle}
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to={sections.closing_cta?.primary_cta_link || '/contact?action=quote'}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...publicUi.primaryButton,
                ...homeUi.touchTarget,
                px: 3.5,
                fontSize: '0.9375rem',
              }}
            >
              {sections.closing_cta?.primary_cta_text}
            </Button>
            {(sections.closing_cta?.link1_text || sections.closing_cta?.link2_text) && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mt: 2 }}
            >
              {sections.closing_cta?.link1_text && sections.closing_cta?.link1_url && (
              <Button
                component={Link}
                to={sections.closing_cta.link1_url}
                variant="text"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { color: colors.green, bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                {sections.closing_cta.link1_text}
              </Button>
              )}
              {sections.closing_cta?.link1_text && sections.closing_cta?.link2_text && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', display: { xs: 'none', sm: 'block' } }}>
                ·
              </Typography>
              )}
              {sections.closing_cta?.link2_text && sections.closing_cta?.link2_url && (
              <Button
                component={Link}
                to={sections.closing_cta.link2_url}
                variant="text"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { color: colors.green, bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                {sections.closing_cta.link2_text}
              </Button>
              )}
            </Stack>
            )}
          </Box>
        </Container>
      </Box>
      <PublicStickyMobileCta label="Get free consultation" to="/contact?action=quote" />
    </Box>
  );
};

export default Services;

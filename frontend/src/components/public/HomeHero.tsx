import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  IconButton,
  Fade,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  SolarPower as SolarIcon,
  BatteryChargingFull as BatteryIcon,
  Hub as GridIcon,
  Insights as MonitorIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homePageImages } from '../../data/homePageMedia';
import { useCmsPage } from '../../hooks/useCmsPage';
import api from '../../services/api';
import { heroAutoplayMs, resolveHeroSlides } from '../../utils/heroSlides';
import type { CmsHeroSlide } from '../../types/cms';

const pillarIcons = [
  <SolarIcon sx={{ fontSize: 18 }} />,
  <BatteryIcon sx={{ fontSize: 18 }} />,
  <GridIcon sx={{ fontSize: 18 }} />,
  <MonitorIcon sx={{ fontSize: 18 }} />,
];

function useSlideImage(slide: CmsHeroSlide, slideIndex: number) {
  const fallback = slide.hero_image || homePageImages.hero;
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    const cmsImage = slide.hero_image?.trim();
    if (cmsImage) {
      setSrc(cmsImage);
      return;
    }
    if (slideIndex !== 0) {
      setSrc(homePageImages.hero);
      return;
    }
    let cancelled = false;
    api
      .get<Record<string, string>>('/content/settings/public')
      .then((res) => {
        const u = res.data?.home_hero_image?.trim();
        if (u && !cancelled) setSrc(u);
        else if (!cancelled) setSrc(homePageImages.hero);
      })
      .catch(() => {
        if (!cancelled) setSrc(homePageImages.hero);
      });
    return () => {
      cancelled = true;
    };
  }, [slide.hero_image, slideIndex]);

  return src;
}

const SlideImage: React.FC<{ slide: CmsHeroSlide; slideIndex: number; active: boolean }> = ({
  slide,
  slideIndex,
  active,
}) => {
  const src = useSlideImage(slide, slideIndex);

  return (
    <Fade in={active} timeout={500}>
      <Box
        sx={{
          position: active ? 'relative' : 'absolute',
          inset: active ? undefined : 0,
          visibility: active ? 'visible' : 'hidden',
          borderRadius: 3.5,
          overflow: 'hidden',
          bgcolor: colors.blueBlack,
          height: '100%',
          minHeight: { xs: 280, sm: 340, md: 420, lg: 480 },
          maxHeight: { xs: 320, sm: 380, md: 460, lg: 520 },
        }}
      >
        <Box
          component="img"
          src={src}
          alt={slide.headline || 'Energy Precisions — solar installation in Ghana'}
          loading={slideIndex === 0 ? 'eager' : 'lazy'}
          fetchPriority={slideIndex === 0 ? 'high' : 'auto'}
          sx={{
            width: '100%',
            height: '100%',
            minHeight: { xs: 280, sm: 340, md: 420, lg: 480 },
            maxHeight: { xs: 320, sm: 380, md: 460, lg: 520 },
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('/portfolio/')) {
              target.src = '/portfolio/ep-install-01.jpg';
            } else if (!target.src.includes('/website_images/')) {
              target.src = '/website_images/remove-bg3.png';
            } else {
              target.style.display = 'none';
            }
          }}
        />
      </Box>
    </Fade>
  );
};

const HomeHero: React.FC = () => {
  const { sections } = useCmsPage('home');
  const hero = sections.hero;
  const slides = useMemo(() => resolveHeroSlides(hero), [hero]);
  const autoplayMs = heroAutoplayMs(hero);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slideCount = slides.length;
  const activeSlide = slides[activeIndex] ?? slides[0];
  const showControls = slideCount > 1;

  const goTo = useCallback(
    (index: number) => {
      if (slideCount <= 1) return;
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slideCount]);

  useEffect(() => {
    if (!showControls || !autoplayMs || paused) return undefined;
    const timer = window.setInterval(goNext, autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplayMs, goNext, paused, showControls]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  return (
    <Box
      component="section"
      aria-label="Hero"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        minHeight: { xs: 'auto', md: 560, lg: 620 },
        py: { xs: 6, sm: 7, md: 8, lg: 9 },
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(128deg, ${colors.blueBlack} 0%, #0c1524 42%, ${colors.blueBlackLight} 72%, #0a1628 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.35,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '55%',
          height: '80%',
          background: `radial-gradient(ellipse at center, ${colors.green}22 0%, transparent 68%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: '18%',
          bottom: '12%',
          width: 4,
          bgcolor: colors.green,
          borderRadius: '0 4px 4px 0',
          boxShadow: `0 0 28px ${colors.green}88`,
          display: { xs: 'none', md: 'block' },
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 5, lg: 6 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box
              aria-live="polite"
              sx={{ position: 'relative', minHeight: { xs: 220, sm: 240, md: 260 } }}
            >
              {slides.map((slide, index) => (
                <Fade in={index === activeIndex} timeout={500} key={`slide-copy-${index}`}>
                  <Box
                    sx={{
                      display: index === activeIndex ? 'block' : 'none',
                    }}
                  >
                    {slide.badge && (
                      <Chip
                        label={slide.badge}
                        sx={{
                          bgcolor: colors.green,
                          color: colors.blueBlack,
                          fontWeight: 700,
                          mb: 2,
                          px: 1.5,
                          height: 32,
                          fontSize: { xs: '0.72rem', sm: '0.8rem' },
                          letterSpacing: 0.4,
                        }}
                      />
                    )}

                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.95rem', sm: '2.35rem', md: '2.75rem', lg: '3.15rem' },
                        fontWeight: 800,
                        mb: 2,
                        lineHeight: { xs: 1.18, md: 1.12 },
                        letterSpacing: '-0.03em',
                        maxWidth: 720,
                      }}
                    >
                      {slide.headline}{' '}
                      {slide.headline_highlight && (
                        <Box
                          component="span"
                          sx={{
                            color: colors.green,
                            textShadow: '0 0 40px rgba(0, 230, 118, 0.35)',
                          }}
                        >
                          {slide.headline_highlight}
                        </Box>
                      )}
                    </Typography>

                    {slide.description && (
                      <Typography
                        component="p"
                        sx={{
                          mb: 2.5,
                          color: 'rgba(255,255,255,0.9)',
                          lineHeight: 1.7,
                          fontSize: { xs: '1rem', md: '1.1rem', lg: '1.15rem' },
                          maxWidth: 640,
                        }}
                      >
                        {slide.description}
                      </Typography>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
                      {slide.primary_cta_text && (
                        <Button
                          variant="contained"
                          size="large"
                          component={Link}
                          to={slide.primary_cta_link || '/contact?action=quote'}
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            bgcolor: colors.green,
                            color: colors.blueBlack,
                            px: 3.5,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: `0 6px 24px ${colors.green}40`,
                            '&:hover': {
                              bgcolor: colors.greenDark,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 10px 32px ${colors.green}50`,
                            },
                            transition: 'all 0.22s ease',
                          }}
                        >
                          {slide.primary_cta_text}
                        </Button>
                      )}
                      {slide.secondary_cta_text && (
                        <Button
                          variant="outlined"
                          size="large"
                          component={Link}
                          to={slide.secondary_cta_link || '/shop'}
                          sx={{
                            borderColor: 'rgba(255,255,255,0.5)',
                            borderWidth: 2,
                            color: 'white',
                            px: 3.5,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: colors.green,
                              bgcolor: 'rgba(0, 230, 118, 0.1)',
                              borderWidth: 2,
                            },
                            transition: 'all 0.22s ease',
                          }}
                        >
                          {slide.secondary_cta_text}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Fade>
              ))}
            </Box>

            {hero.pillars?.length > 0 && (
              <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                spacing={1}
                sx={{ mb: 3, gap: 1, mt: 1 }}
              >
                {hero.pillars.map((label, i) => (
                  <Chip
                    key={label}
                    icon={pillarIcons[i] ?? pillarIcons[0]}
                    label={label}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.92)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      '& .MuiChip-icon': { color: colors.green },
                    }}
                  />
                ))}
              </Stack>
            )}

            {hero.stats?.length > 0 && (
              <Stack
                direction="row"
                spacing={{ xs: 2.5, sm: 4 }}
                sx={{ mb: showControls ? 2 : 3, flexWrap: 'wrap', rowGap: 1.5 }}
              >
                {hero.stats.map((s) => (
                  <Box key={s.label}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}

            {showControls && (
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <IconButton
                  aria-label="Previous slide"
                  onClick={goPrev}
                  sx={{
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: colors.green },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Stack direction="row" spacing={1} role="tablist" aria-label="Hero slides">
                  {slides.map((slide, index) => (
                    <Box
                      key={`dot-${index}`}
                      component="button"
                      type="button"
                      role="tab"
                      aria-selected={index === activeIndex}
                      aria-label={`Slide ${index + 1}: ${slide.badge || slide.headline}`}
                      onClick={() => goTo(index)}
                      sx={{
                        width: index === activeIndex ? 28 : 10,
                        height: 10,
                        borderRadius: 999,
                        border: 'none',
                        p: 0,
                        cursor: 'pointer',
                        bgcolor: index === activeIndex ? colors.green : 'rgba(255,255,255,0.35)',
                        transition: 'width 0.2s ease, background-color 0.2s ease',
                      }}
                    />
                  ))}
                </Stack>
                <IconButton
                  aria-label="Next slide"
                  onClick={goNext}
                  sx={{
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: colors.green },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Stack>
            )}

            {(hero.link1_text || hero.link2_text) && (
              <Stack
                direction="row"
                component="nav"
                aria-label="Planning tools"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 0.5, rowGap: 0.75 }}
              >
                {hero.link1_text && hero.link1_url && (
                  <Typography
                    component={Link}
                    to={hero.link1_url}
                    variant="body2"
                    sx={{
                      color: colors.green,
                      fontWeight: 700,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {hero.link1_text}
                  </Typography>
                )}
                {hero.link1_text && hero.link2_text && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    ·
                  </Typography>
                )}
                {hero.link2_text && hero.link2_url && (
                  <Typography
                    component={Link}
                    to={hero.link2_url}
                    variant="body2"
                    sx={{
                      color: colors.green,
                      fontWeight: 700,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {hero.link2_text}
                  </Typography>
                )}
              </Stack>
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 4,
                p: { xs: 0, md: '3px' },
                background: `linear-gradient(145deg, ${colors.green}88, transparent 45%, ${colors.green}44)`,
                boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
                maxHeight: { xs: 320, sm: 380, md: 460, lg: 520 },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  bgcolor: colors.blueBlack,
                  height: '100%',
                  minHeight: { xs: 280, sm: 340, md: 420, lg: 480 },
                  maxHeight: { xs: 320, sm: 380, md: 460, lg: 520 },
                }}
              >
                {slides.map((slide, index) => (
                  <SlideImage
                    key={`slide-image-${index}`}
                    slide={slide}
                    slideIndex={index}
                    active={index === activeIndex}
                  />
                ))}
              </Box>
              {activeSlide?.image_overlay && (
                <Fade in key={`overlay-${activeIndex}`} timeout={500}>
                  <Chip
                    label={activeSlide.image_overlay}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 12, md: 20 },
                      left: { xs: 12, md: 20 },
                      bgcolor: 'rgba(10, 14, 23, 0.85)',
                      color: 'white',
                      fontWeight: 600,
                      border: `1px solid ${colors.green}66`,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                </Fade>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomeHero;

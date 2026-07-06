import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Stack,
  Fade,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homePageImages } from '../../data/homePageMedia';
import { useCmsPage } from '../../hooks/useCmsPage';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import api from '../../services/api';
import { heroAutoplayMs, resolveHeroSlides } from '../../utils/heroSlides';
import type { CmsHeroSlide } from '../../types/cms';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

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

  return resolveMediaUrl(src);
}

const SlideBackground: React.FC<{
  slide: CmsHeroSlide;
  slideIndex: number;
  active: boolean;
  reducedMotion: boolean;
}> = ({ slide, slideIndex, active, reducedMotion }) => {
  const src = useSlideImage(slide, slideIndex);

  return (
    <Box
      aria-hidden={!active}
      sx={{
        position: 'absolute',
        inset: 0,
        opacity: active ? 1 : 0,
        transition: reducedMotion ? 'none' : 'opacity 0.9s ease-in-out',
        pointerEvents: 'none',
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        loading={slideIndex === 0 ? 'eager' : 'lazy'}
        fetchPriority={slideIndex === 0 ? 'high' : 'auto'}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          transform: active && !reducedMotion ? 'scale(1.06)' : 'scale(1)',
          transition: reducedMotion
            ? 'none'
            : active
              ? 'transform 8s ease-out'
              : 'transform 0.4s ease-out',
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.src.includes('/portfolio/')) {
            target.src = resolveMediaUrl('/portfolio/ep-install-01.jpg');
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(105deg,
              rgba(10, 14, 23, 0.92) 0%,
              rgba(10, 14, 23, 0.78) 38%,
              rgba(10, 14, 23, 0.45) 62%,
              rgba(10, 14, 23, 0.25) 100%
            )
          `,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,14,23,0.85) 0%, transparent 45%)',
        }}
      />
    </Box>
  );
};

const HomeHero: React.FC = () => {
  const { sections } = useCmsPage('home');
  const { heroStats } = useGlobalSiteConfig();
  const hero = sections.hero;
  const slides = useMemo(() => resolveHeroSlides(hero), [hero]);
  const autoplayMs = heroAutoplayMs(hero);
  const reducedMotion = usePrefersReducedMotion();
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
    if (!showControls || !autoplayMs || paused || reducedMotion) return undefined;
    const timer = window.setInterval(goNext, autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplayMs, goNext, paused, reducedMotion, showControls]);

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        minHeight: { xs: '72dvh', sm: '68dvh', md: 620 },
        maxHeight: { md: 760 },
        bgcolor: colors.blueBlack,
      }}
    >
      {slides.map((slide, index) => (
        <SlideBackground
          key={`bg-${index}`}
          slide={slide}
          slideIndex={index}
          active={index === activeIndex}
          reducedMotion={reducedMotion}
        />
      ))}

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          minHeight: { xs: '72dvh', sm: '68dvh', md: 620 },
          maxHeight: { md: 760 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: { xs: 6, md: 8 },
          px: { xs: 2.5, sm: 3 },
        }}
      >
        <Box aria-live="polite" sx={{ maxWidth: 620 }}>
          <Fade in key={`content-${activeIndex}`} timeout={reducedMotion ? 0 : 600}>
            <Box>
              {activeSlide?.badge && (
                <Chip
                  label={activeSlide.badge}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 230, 118, 0.15)',
                    color: colors.green,
                    border: `1px solid rgba(0, 230, 118, 0.45)`,
                    fontWeight: 700,
                    mb: 2,
                    height: 30,
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    backdropFilter: 'blur(8px)',
                  }}
                />
              )}

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem', lg: '3.5rem' },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  textShadow: '0 2px 24px rgba(0,0,0,0.35)',
                }}
              >
                {activeSlide?.headline}{' '}
                {activeSlide?.headline_highlight && (
                  <Box
                    component="span"
                    sx={{
                      color: colors.green,
                      display: 'inline',
                    }}
                  >
                    {activeSlide.headline_highlight}
                  </Box>
                )}
              </Typography>

              {activeSlide?.description && (
                <Typography
                  component="p"
                  sx={{
                    mb: 3,
                    color: 'rgba(255,255,255,0.88)',
                    lineHeight: 1.65,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    maxWidth: 520,
                    textShadow: '0 1px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {activeSlide.description}
                </Typography>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                {activeSlide?.primary_cta_text && (
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to={activeSlide.primary_cta_link || '/contact?action=quote'}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: colors.green,
                      color: colors.blueBlack,
                      px: 3.5,
                      py: 1.35,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      boxShadow: `0 8px 32px rgba(0, 230, 118, 0.35)`,
                      '&:hover': {
                        bgcolor: colors.greenDark,
                        boxShadow: `0 12px 40px rgba(0, 230, 118, 0.45)`,
                      },
                    }}
                  >
                    {activeSlide.primary_cta_text}
                  </Button>
                )}
                {activeSlide?.secondary_cta_text && activeSlide.secondary_cta_link && (
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to={activeSlide.secondary_cta_link}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.45)',
                      color: 'white',
                      px: 3,
                      py: 1.35,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      backdropFilter: 'blur(6px)',
                      bgcolor: 'rgba(255,255,255,0.04)',
                      '&:hover': {
                        borderColor: colors.green,
                        bgcolor: 'rgba(0, 230, 118, 0.08)',
                      },
                    }}
                  >
                    {activeSlide.secondary_cta_text}
                  </Button>
                )}
              </Stack>

              {heroStats.length > 0 && (
                <Stack
                  direction="row"
                  spacing={{ xs: 2, sm: 3 }}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 3 }}
                >
                  {heroStats.map((stat) => (
                    <Box key={stat.label}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: colors.green,
                          lineHeight: 1.1,
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Fade>
        </Box>

        {showControls && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mt: { xs: 4, md: 5 } }}
            role="tablist"
            aria-label="Hero slides"
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                minWidth: 48,
              }}
            >
              {String(activeIndex + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
            </Typography>
            <Stack direction="row" spacing={0.25} alignItems="center">
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    border: 'none',
                    p: 0,
                    cursor: 'pointer',
                    bgcolor: 'transparent',
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: index === activeIndex ? 32 : 8,
                      height: 3,
                      borderRadius: 999,
                      bgcolor: index === activeIndex ? colors.green : 'rgba(255,255,255,0.35)',
                      transition: reducedMotion ? 'none' : 'width 0.25s ease, background-color 0.25s ease',
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default HomeHero;

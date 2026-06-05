import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  Fade,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homePageImages } from '../../data/homePageMedia';
import { useCmsPage } from '../../hooks/useCmsPage';
import api from '../../services/api';
import { heroAutoplayMs, resolveHeroSlides } from '../../utils/heroSlides';
import type { CmsHeroSlide } from '../../types/cms';

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
    <Fade in={active} timeout={450}>
      <Box
        component="img"
        src={src}
        alt={slide.headline || 'Energy Precisions — solar installation in Ghana'}
        loading={slideIndex === 0 ? 'eager' : 'lazy'}
        fetchPriority={slideIndex === 0 ? 'high' : 'auto'}
        sx={{
          position: active ? 'relative' : 'absolute',
          inset: active ? undefined : 0,
          visibility: active ? 'visible' : 'hidden',
          width: '100%',
          height: '100%',
          minHeight: { xs: 240, md: 360 },
          maxHeight: { xs: 280, md: 420 },
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block',
          borderRadius: 3,
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        py: { xs: 4, md: 5 },
        background: `linear-gradient(135deg, ${colors.blueBlack} 0%, #0c1524 55%, ${colors.blueBlackLight} 100%)`,
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box aria-live="polite" sx={{ minHeight: { xs: 200, md: 240 } }}>
              {slides.map((slide, index) => (
                <Fade in={index === activeIndex} timeout={450} key={`slide-copy-${index}`}>
                  <Box sx={{ display: index === activeIndex ? 'block' : 'none' }}>
                    {slide.badge && (
                      <Chip
                        label={slide.badge}
                        size="small"
                        sx={{
                          bgcolor: colors.green,
                          color: colors.blueBlack,
                          fontWeight: 700,
                          mb: 1.5,
                          height: 28,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}

                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.35rem' },
                        fontWeight: 800,
                        mb: 1.5,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {slide.headline}{' '}
                      {slide.headline_highlight && (
                        <Box component="span" sx={{ color: colors.green }}>
                          {slide.headline_highlight}
                        </Box>
                      )}
                    </Typography>

                    {slide.description && (
                      <Typography
                        component="p"
                        sx={{
                          mb: 2.5,
                          color: 'rgba(255,255,255,0.82)',
                          lineHeight: 1.6,
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          maxWidth: 480,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {slide.description}
                      </Typography>
                    )}

                    {slide.primary_cta_text && (
                      <Button
                        variant="contained"
                        size="medium"
                        component={Link}
                        to={slide.primary_cta_link || '/contact?action=quote'}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          bgcolor: colors.green,
                          color: colors.blueBlack,
                          px: 2.75,
                          py: 1.25,
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: colors.greenDark, boxShadow: 'none' },
                        }}
                      >
                        {slide.primary_cta_text}
                      </Button>
                    )}

                    {slide.secondary_cta_text && slide.secondary_cta_link && (
                      <Typography
                        component={Link}
                        to={slide.secondary_cta_link}
                        variant="body2"
                        sx={{
                          display: 'block',
                          mt: 1.5,
                          color: 'rgba(255,255,255,0.75)',
                          textDecoration: 'none',
                          '&:hover': { color: colors.green },
                        }}
                      >
                        {slide.secondary_cta_text} →
                      </Typography>
                    )}
                  </Box>
                </Fade>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: colors.blueBlack,
                minHeight: { xs: 240, md: 360 },
                maxHeight: { xs: 280, md: 420 },
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
          </Grid>
        </Grid>

        {showControls && (
          <Stack direction="row" spacing={0.75} justifyContent="center" sx={{ mt: 2.5 }} role="tablist" aria-label="Hero slides">
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
                  width: index === activeIndex ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: 'none',
                  p: 0,
                  cursor: 'pointer',
                  bgcolor: index === activeIndex ? colors.green : 'rgba(255,255,255,0.3)',
                  transition: 'width 0.2s ease, background-color 0.2s ease',
                }}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default HomeHero;

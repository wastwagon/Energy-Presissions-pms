import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import HomeSectionHeader from './HomeSectionHeader';
import type { CmsPortfolioItem } from '../../types/cms';

const AUTOPLAY_MS = 5500;

type Props = {
  badge?: string;
  title?: string;
  subtitle?: string;
  items: CmsPortfolioItem[];
  ctaText?: string;
  ctaLink?: string;
};

const HomePortfolioSection: React.FC<Props> = ({
  badge,
  title,
  subtitle,
  items,
  ctaText = 'View all projects',
  ctaLink = '/portfolio',
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const count = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (count <= 0) return;
      const next = ((index % count) + count) % count;
      const track = trackRef.current;
      const slide = slideRefs.current[next];
      if (track && slide) {
        track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
      }
      setActiveIndex(next);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    setActiveIndex(0);
    trackRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [count]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (count <= 1 || paused || !inView) return undefined;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, goNext, paused, inView]);

  const syncIndexFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(center - slideCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = index;
      }
    });
    setActiveIndex(closest);
  }, [count]);

  if (count === 0) return null;

  return (
    <Box
      ref={sectionRef}
      component="section"
      aria-roledescription="carousel"
      aria-label="Project portfolio"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      sx={{ bgcolor: homeUi.cardBg, py: homeUi.sectionPy, overflow: 'hidden' }}
    >
      <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-end' }}
          spacing={2}
          mb={{ xs: 3, md: 4 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <HomeSectionHeader
              badge={badge}
              title={title}
              subtitle={subtitle}
              align="left"
              compact
              maxSubtitleWidth={520}
            />
          </Box>
          {count > 1 && (
            <Stack direction="row" spacing={1} sx={{ pb: 0.5 }}>
              <IconButton
                aria-label="Previous project"
                onClick={goPrev}
                sx={{
                  border: homeUi.cardBorder,
                  bgcolor: homeUi.cardBg,
                  width: 44,
                  height: 44,
                  boxShadow: homeUi.cardShadow,
                  '&:hover': { bgcolor: colors.gray100 },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                aria-label="Next project"
                onClick={goNext}
                sx={{
                  border: homeUi.cardBorder,
                  bgcolor: homeUi.cardBg,
                  width: 44,
                  height: 44,
                  boxShadow: homeUi.cardShadow,
                  '&:hover': { bgcolor: colors.gray100 },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Container>

      <Box
        ref={trackRef}
        onScroll={syncIndexFromScroll}
        sx={{
          display: 'flex',
          gap: { xs: 2, md: 2.5 },
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          px: homeUi.containerPx,
          pl: { xs: 2, sm: 3, md: 'max(24px, calc((100vw - 1200px) / 2 + 24px))' },
          pr: { xs: 2, sm: 3, md: 4 },
          pb: 1,
        }}
      >
        {items.map((project, index) => {
          const active = index === activeIndex;
          return (
            <Box
              key={`${project.title}-${index}`}
              ref={(el: HTMLAnchorElement | null) => {
                slideRefs.current[index] = el;
              }}
              component={Link}
              to={project.link || ctaLink}
              aria-label={project.title}
              sx={{
                flex: {
                  xs: '0 0 min(84vw, 300px)',
                  sm: '0 0 min(62vw, 360px)',
                  md: '0 0 min(38vw, 400px)',
                  lg: '0 0 min(32vw, 420px)',
                },
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.25, md: 1.5 },
                borderRadius: homeUi.cardRadius,
                bgcolor: homeUi.cardBg,
                border: active ? `1px solid rgba(0, 230, 118, 0.35)` : homeUi.cardBorder,
                boxShadow: active ? homeUi.cardShadowHover : homeUi.cardShadow,
                transition: 'box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease',
                transform: active ? 'translateY(-6px)' : 'none',
                '@media (hover: hover)': {
                  '&:hover': {
                    boxShadow: homeUi.cardShadowHover,
                    borderColor: 'rgba(0, 230, 118, 0.35)',
                    transform: 'translateY(-6px)',
                    '& .portfolio-photo': { transform: 'scale(1.03)' },
                  },
                },
              }}
            >
              <Box
                sx={{
                  borderRadius: homeUi.innerRadius,
                  overflow: 'hidden',
                  aspectRatio: '16 / 11',
                  bgcolor: colors.gray100,
                  mb: { xs: 1.75, md: 2 },
                }}
              >
                <Box
                  className="portfolio-photo"
                  component="img"
                  src={resolveMediaUrl(project.image)}
                  alt={project.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.55s ease',
                  }}
                />
              </Box>

              <Box sx={{ px: { xs: 0.5, md: 0.75 }, pb: { xs: 0.5, md: 0.75 }, textAlign: 'left', flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.blueBlack,
                    fontSize: { xs: '1.0625rem', md: '1.125rem' },
                    letterSpacing: '-0.022em',
                    lineHeight: 1.3,
                    mb: 0.75,
                  }}
                >
                  {project.title}
                </Typography>
                {project.alt && (
                  <Typography
                    sx={{
                      color: colors.gray600,
                      fontSize: '0.8125rem',
                      lineHeight: 1.55,
                      mb: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {project.alt}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.35,
                    color: colors.green,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    mt: 'auto',
                  }}
                >
                  View project
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {count > 1 && (
        <Stack
          direction="row"
          spacing={0.75}
          justifyContent="center"
          role="tablist"
          aria-label="Portfolio slides"
          sx={{ mt: 2.5, px: 2 }}
        >
          {items.map((project, index) => (
            <Box
              key={`dot-${project.title}-${index}`}
              component="button"
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to ${project.title}`}
              onClick={() => goTo(index)}
              sx={{
                width: index === activeIndex ? 28 : 8,
                height: 8,
                borderRadius: 999,
                border: 'none',
                p: 0,
                cursor: 'pointer',
                bgcolor: index === activeIndex ? colors.green : 'rgba(0,0,0,0.15)',
                transition: 'width 0.25s ease, background-color 0.25s ease',
              }}
            />
          ))}
        </Stack>
      )}

      <Container maxWidth="lg" sx={{ px: homeUi.containerPx, mt: { xs: 3, md: 4 } }}>
        <Button
          component={Link}
          to={ctaLink}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
          sx={{
            ...homeUi.touchTarget,
            borderRadius: 999,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: colors.blueBlack,
            bgcolor: homeUi.cardBg,
            border: homeUi.cardBorder,
            boxShadow: homeUi.cardShadow,
            '&:hover': { bgcolor: homeUi.cardBg, boxShadow: homeUi.cardShadowHover },
          }}
        >
          {ctaText}
        </Button>
      </Container>
    </Box>
  );
};

export default HomePortfolioSection;

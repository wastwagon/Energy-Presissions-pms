import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  SolarPower as SolarIcon,
  BatteryChargingFull as BatteryIcon,
  Hub as GridIcon,
  Insights as MonitorIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homePageImages } from '../../data/homePageMedia';
import api from '../../services/api';

const transitionPillars = [
  { icon: <SolarIcon sx={{ fontSize: 18 }} />, label: 'Solar generation' },
  { icon: <BatteryIcon sx={{ fontSize: 18 }} />, label: 'Lithium storage' },
  { icon: <GridIcon sx={{ fontSize: 18 }} />, label: 'Hybrid backup' },
  { icon: <MonitorIcon sx={{ fontSize: 18 }} />, label: 'Monitoring' },
];

const stats = [
  { value: '500+', label: 'Systems delivered' },
  { value: '10+', label: 'Years engineering' },
  { value: '98%', label: 'Client satisfaction' },
];

const HomeHero: React.FC = () => {
  const [heroSrc, setHeroSrc] = useState<string>(homePageImages.hero);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Record<string, string>>('/content/settings/public')
      .then((res) => {
        const u = res.data?.home_hero_image?.trim();
        if (u && !cancelled) setHeroSrc(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box
      component="section"
      aria-label="Energy transition"
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
            <Chip
              label="Ghana's energy transition partner"
              sx={{
                bgcolor: 'rgba(0, 230, 118, 0.14)',
                color: colors.green,
                border: `1px solid ${colors.green}55`,
                fontWeight: 700,
                mb: 2,
                px: 1.5,
                height: 32,
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.95rem', sm: '2.35rem', md: '2.75rem', lg: '3.05rem' },
                fontWeight: 800,
                mb: 2,
                lineHeight: { xs: 1.18, md: 1.12 },
                letterSpacing: '-0.03em',
                maxWidth: 720,
              }}
            >
              Powering Ghana&apos;s{' '}
              <Box
                component="span"
                sx={{
                  display: 'block',
                  color: colors.green,
                  textShadow: '0 0 40px rgba(0, 230, 118, 0.35)',
                }}
              >
                energy transition
              </Box>
            </Typography>

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
              From rooftop solar and lithium backup to grid-ready hybrid systems — we design,
              supply, install, and maintain intelligent power for homes, businesses, and industry
              across Ghana.
            </Typography>

            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
              sx={{ mb: 3, gap: 1 }}
            >
              {transitionPillars.map((p) => (
                <Chip
                  key={p.label}
                  icon={p.icon}
                  label={p.label}
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

            <Stack
              direction="row"
              spacing={{ xs: 2.5, sm: 4 }}
              sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1.5 }}
            >
              {stats.map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    minWidth: 100,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.green, lineHeight: 1.1 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/contact?action=quote"
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
                Plan your system
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/solar-packages"
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
                Hybrid lithium packages
              </Button>
            </Stack>

            <Stack
              direction="row"
              component="nav"
              aria-label="Planning tools"
              spacing={2}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 2.5, rowGap: 0.75 }}
            >
              <Typography
                component={Link}
                to="/solar-estimate"
                variant="body2"
                sx={{
                  color: colors.green,
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Solar size estimator
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                ·
              </Typography>
              <Typography
                component={Link}
                to="/load-calculator"
                variant="body2"
                sx={{
                  color: colors.green,
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Appliance load calculator
              </Typography>
            </Stack>
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
                  src={heroSrc}
                  alt="Energy Precisions — solar and hybrid power installation in Ghana"
                  loading="eager"
                  fetchPriority="high"
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
              <Chip
                label="Turnkey · Grid & generator ready"
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
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomeHero;

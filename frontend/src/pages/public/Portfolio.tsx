import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import PublicPageShell from '../../components/public/PublicPageShell';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import FilterChip from '../../components/public/FilterChip';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { getPortfolioCategoriesFromItems, getPortfolioItemPath, resolvePortfolioItems } from '../../data/portfolioCms';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const Portfolio: React.FC = () => {
  const { cta } = useGlobalSiteConfig();
  const { sections } = useCmsPage('portfolio');
  const reducedMotion = usePrefersReducedMotion();
  const seo = resolveCmsSeo(sections, {
    title: 'Solar Project Portfolio Ghana | Energy Precisions',
    description:
      'Residential, commercial, industrial and community solar projects across Ghana — design, installation and support from Energy Precisions.',
  });
  const { hero, closing_cta: closingCta } = sections;
  const items = useMemo(() => resolvePortfolioItems(sections.items), [sections.items]);
  const categories = useMemo(() => getPortfolioCategoriesFromItems(items), [items]);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((p) => p.category === activeCategory);
  }, [activeCategory, items]);

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/portfolio" />
      <PublicPageShell
        badge={hero.badge}
        headline={hero.headline}
        description={hero.description}
        contentPy={{ xs: 4, md: 7 }}
      >
        <Box
          sx={{
            mb: 3,
            mx: { xs: -2, sm: 0 },
            px: { xs: 2, sm: 0 },
            overflowX: { xs: 'auto', sm: 'visible' },
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Stack
            direction="row"
            flexWrap={{ xs: 'nowrap', sm: 'wrap' }}
            gap={1}
            role="group"
            aria-label="Filter by category"
            sx={{ pb: { xs: 0.5, sm: 0 }, minWidth: { xs: 'min-content', sm: 'auto' } }}
          >
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              selected={activeCategory === cat}
              onSelect={() => setActiveCategory(cat)}
            />
          ))}
          </Stack>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {filtered.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                component={Link}
                to={getPortfolioItemPath(item)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  ...publicUi.card,
                  borderRadius: homeUi.innerRadius,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:active': { transform: 'scale(0.98)' },
                  '@media (hover: hover)': {
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: homeUi.cardShadowHover,
                      borderColor: colors.green,
                      '& .portfolio-image': { transform: reducedMotion ? 'none' : 'scale(1.03)' },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    height: { xs: 200, sm: 220 },
                    overflow: 'hidden',
                    bgcolor: colors.gray200,
                    position: 'relative',
                  }}
                >
                  {item.mediaType === 'video' ? (
                    <Box
                      component="video"
                      src={resolveMediaUrl(item.image)}
                      muted
                      playsInline
                      loop={!reducedMotion}
                      autoPlay={!reducedMotion}
                      className="portfolio-image"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                  ) : (
                    <CardMedia
                      component="img"
                      image={resolveMediaUrl(item.image)}
                      alt={item.title}
                      className="portfolio-image"
                      sx={{ height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                  )}
                  {item.featured && (
                    <Chip
                      label="Featured"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        height: 22,
                        bgcolor: colors.blueBlack,
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.25 } }}>
                  <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                    <Chip label={item.category} size="small" sx={{ height: 22, ...homeUi.chip }} />
                    {item.systemSize && (
                      <Chip label={item.systemSize} size="small" variant="outlined" sx={{ height: 22, ...homeUi.chip }} />
                    )}
                  </Stack>
                  <Typography sx={{ ...homeUi.cardTitle, color: colors.blueBlack, mb: 0.75 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.gray600, mb: 1, display: 'block' }}>
                    {item.location}
                  </Typography>
                  <Typography sx={{ ...publicUi.mutedText, ...homeUi.caption }}>{item.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </PublicPageShell>

      <Box
        sx={{
          py: { xs: 6, md: 7 },
          background: publicUi.topBar.bgGradient,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm" sx={{ px: publicUi.containerPx }}>
          <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            {closingCta.title}
          </Typography>
          <Typography sx={{ ...homeUi.body, color: 'rgba(255,255,255,0.88)', mb: 2.5, lineHeight: 1.6 }}>
            {closingCta.subtitle}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to={closingCta.primary_cta_link || cta.quoteHref}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3.5 }}
          >
            {closingCta.primary_cta_text || cta.consultation}
          </Button>
        </Container>
      </Box>

      <PublicStickyMobileCta label={cta.consultation} to={cta.quoteHref} />
    </>
  );
};

export default Portfolio;

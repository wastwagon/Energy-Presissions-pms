import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { blogPosts, getBlogPost, resolveBlogFeaturedImage, type BlogPost } from '../../data/blogPosts';
import { SITE_CTA } from '../../data/siteCta';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import api from '../../services/api';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<(BlogPost & { featuredImage: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) {
      setMissing(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          display_date: string;
          read_time: string;
          category?: string;
          featured_image?: string;
        }>(`/content/blog/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        const body = res.data.body || '';
        const paragraphs = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
        setPost({
          slug: res.data.slug,
          title: res.data.title,
          excerpt: res.data.excerpt,
          category: res.data.category || 'Ghana',
          date: res.data.display_date,
          readTime: res.data.read_time,
          featuredImage: resolveBlogFeaturedImage(res.data.slug, res.data.featured_image),
          paragraphs: paragraphs.length ? paragraphs : [body.trim() || res.data.excerpt],
        });
      } catch {
        if (cancelled) return;
        const local = getBlogPost(slug);
        if (local) setPost(local);
        else setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const related = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.slug !== post.slug && p.category === post.category)
      .slice(0, 3);
  }, [post]);

  if (!slug || missing || (!loading && !post)) {
    return <Navigate to="/blog" replace />;
  }

  if (loading || !post) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  const heroImage = resolveMediaUrl(post.featuredImage);

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        ogImage={heroImage}
      />
      <PublicPageShell
        badge={post.category}
        headline={post.title}
        description={post.excerpt}
        contentMaxWidth="lg"
        contentPy={{ xs: 3, md: 5 }}
      >
        <Button
          component={RouterLink}
          to="/blog"
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 2,
            textTransform: 'none',
            color: colors.blueNavy,
            ...homeUi.touchTarget,
            justifyContent: 'flex-start',
            px: 0,
          }}
        >
          All articles
        </Button>

        <Box
          sx={{
            borderRadius: homeUi.cardRadius,
            overflow: 'hidden',
            border: homeUi.cardBorder,
            mb: 3,
            bgcolor: colors.gray100,
            boxShadow: homeUi.cardShadow,
          }}
        >
          <Box
            component="img"
            src={heroImage}
            alt={post.title}
            sx={{
              width: '100%',
              maxHeight: { xs: 280, sm: 380, md: 460 },
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 3, pb: 2.5, borderBottom: homeUi.cardBorder }}
        >
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: '14px !important' }} />}
            label={post.date}
            size="small"
            variant="outlined"
            sx={{ height: 30, '& .MuiChip-label': { px: 1 } }}
          />
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
            label={post.readTime}
            size="small"
            variant="outlined"
            sx={{ height: 30, '& .MuiChip-label': { px: 1 } }}
          />
          <Chip
            label={post.category}
            size="small"
            sx={{ height: 30, bgcolor: colors.greenLight, color: colors.blueBlack, fontWeight: 600 }}
          />
        </Stack>

        <Grid container spacing={{ xs: 0, md: 4 }}>
          <Grid item xs={12} md={8}>
            <Box
              component="article"
              sx={{
                '& p': {
                  mb: 2.5,
                  fontSize: { xs: '1.0625rem', md: '1.125rem' },
                  lineHeight: 1.75,
                  color: colors.gray600,
                  letterSpacing: '-0.01em',
                },
                '& p:first-of-type': {
                  fontSize: { xs: '1.125rem', md: '1.2rem' },
                  color: colors.blueBlack,
                  fontWeight: 500,
                  lineHeight: 1.65,
                },
              }}
            >
              {post.paragraphs.map((p, i) => (
                <Typography key={i} component="p">
                  {p}
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 96 },
                p: { xs: 2.5, md: 3 },
                borderRadius: homeUi.innerRadius,
                border: homeUi.cardBorder,
                bgcolor: '#f8faf9',
                mb: { xs: 4, md: 0 },
              }}
            >
              <Typography sx={{ fontWeight: 800, color: colors.blueBlack, mb: 1, fontSize: '1rem' }}>
                Need help sizing your system?
              </Typography>
              <Typography sx={{ ...publicUi.mutedText, mb: 2, lineHeight: 1.6, fontSize: '0.875rem' }}>
                Share your bills and site details — we will recommend a design tied to your loads and tariff in Ghana.
              </Typography>
              <Button
                component={RouterLink}
                to={SITE_CTA.quoteHref}
                variant="contained"
                fullWidth
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, mb: 2 }}
              >
                {SITE_CTA.consultation}
              </Button>
              <Button
                component={RouterLink}
                to="/load-calculator"
                variant="outlined"
                fullWidth
                sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget }}
              >
                Try load calculator
              </Button>
            </Box>
          </Grid>
        </Grid>

        {related.length > 0 && (
          <Box sx={{ mt: { xs: 4, md: 6 }, pt: 4, borderTop: homeUi.cardBorder }}>
            <Typography sx={{ ...homeUi.title, fontSize: '1.25rem', mb: 2.5 }}>
              More in {post.category}
            </Typography>
            <Grid container spacing={2}>
              {related.map((rel) => (
                <Grid item xs={12} sm={4} key={rel.slug}>
                  <Card
                    component={RouterLink}
                    to={`/blog/${rel.slug}`}
                    sx={{
                      ...publicUi.card,
                      overflow: 'hidden',
                      textDecoration: 'none',
                      color: 'inherit',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      '@media (hover: hover)': {
                        '&:hover': { borderColor: colors.green, boxShadow: homeUi.cardShadowHover },
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={resolveMediaUrl(rel.featuredImage)}
                      alt={rel.title}
                      sx={{ height: 120, objectFit: 'cover' }}
                    />
                    <Box sx={{ p: 1.75, flexGrow: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: colors.blueBlack,
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {rel.title}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </PublicPageShell>
      <PublicStickyMobileCta label={SITE_CTA.consultation} to={SITE_CTA.quoteHref} />
    </>
  );
};

export default BlogPostPage;

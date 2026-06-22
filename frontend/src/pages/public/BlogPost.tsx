import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, Navigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, Stack, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { getBlogPost, type BlogPost } from '../../data/blogPosts';
import { SITE_CTA } from '../../data/siteCta';
import api from '../../services/api';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
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
        const res = await api.get<{ slug: string; title: string; excerpt: string; body: string; display_date: string; read_time: string }>(
          `/content/blog/${encodeURIComponent(slug)}`
        );
        if (cancelled) return;
        const body = res.data.body || '';
        const paragraphs = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
        setPost({
          slug: res.data.slug,
          title: res.data.title,
          excerpt: res.data.excerpt,
          category: (res.data as { category?: string }).category || 'Ghana',
          date: res.data.display_date,
          readTime: res.data.read_time,
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

  return (
    <>
      <Seo title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} />
      <PublicPageShell
        badge={post.category}
        headline={post.title}
        description={post.excerpt}
        contentMaxWidth="md"
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
        <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
          <Chip label={post.date} size="small" variant="outlined" sx={{ height: 28 }} />
          <Chip label={post.readTime} size="small" variant="outlined" sx={{ height: 28 }} />
        </Stack>
        <Box
          component="article"
          sx={{
            maxWidth: 680,
            mx: 'auto',
            '& p': {
              mb: 2.5,
              fontSize: { xs: '1.0625rem', md: '1.125rem' },
              lineHeight: 1.7,
              color: colors.gray600,
              letterSpacing: '-0.01em',
            },
            '& p:first-of-type': {
              fontSize: { xs: '1.125rem', md: '1.1875rem' },
              color: colors.blueBlack,
            },
          }}
        >
          {post.paragraphs.map((p, i) => (
            <Typography key={i} component="p">
              {p}
            </Typography>
          ))}
        </Box>
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: homeUi.cardBorder,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Typography sx={{ ...publicUi.mutedText, mb: 1.5 }}>Need a system sized for your site?</Typography>
          <Button
            component={RouterLink}
            to={SITE_CTA.quoteHref}
            variant="contained"
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
          >
            {SITE_CTA.consultation}
          </Button>
        </Box>
      </PublicPageShell>
      <PublicStickyMobileCta label={SITE_CTA.consultation} to={SITE_CTA.quoteHref} />
    </>
  );
};

export default BlogPostPage;

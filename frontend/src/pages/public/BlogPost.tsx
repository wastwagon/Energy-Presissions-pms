import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, Navigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, Stack, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
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
          size="small"
          sx={{ mb: 2, textTransform: 'none', color: colors.blueNavy }}
        >
          All articles
        </Button>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={post.date} size="small" variant="outlined" />
          <Chip label={post.readTime} size="small" variant="outlined" />
        </Stack>
        <Box component="article" sx={{ '& p': { mb: 2, ...homeUi.body, ...publicUi.mutedText } }}>
          {post.paragraphs.map((p, i) => (
            <Typography key={i} component="p" variant="body2">
              {p}
            </Typography>
          ))}
        </Box>
        <Box sx={{ mt: 3, pt: 3, borderTop: homeUi.cardBorder }}>
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
    </>
  );
};

export default BlogPostPage;

import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, Navigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Chip, Stack, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { getBlogPost, type BlogPost } from '../../data/blogPosts';
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
    <Box sx={{ py: { xs: 3, md: 5 } }}>
      <Seo title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} />
      <Container maxWidth="md">
        <Button
          component={RouterLink}
          to="/blog"
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{ mb: 2, textTransform: 'none', color: colors.blueNavy }}
        >
          All articles
        </Button>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
          <Chip label={post.date} size="small" variant="outlined" />
          <Chip label={post.readTime} size="small" variant="outlined" />
        </Stack>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.85rem' }, fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
          {post.excerpt}
        </Typography>
        <Box component="article" sx={{ '& p': { mb: 2, lineHeight: 1.7, color: 'text.primary' } }}>
          {post.paragraphs.map((p, i) => (
            <Typography key={i} component="p" variant="body2">
              {p}
            </Typography>
          ))}
        </Box>
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Need a system sized for your site?
          </Typography>
          <Button
            component={RouterLink}
            to="/contact?action=quote"
            variant="contained"
            size="medium"
            sx={{ bgcolor: colors.green, '&:hover': { bgcolor: colors.greenDark }, textTransform: 'none' }}
          >
            Request a quote
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default BlogPostPage;

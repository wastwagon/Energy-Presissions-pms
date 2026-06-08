import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Button,
  Box,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import FilterChip from '../../components/public/FilterChip';
import { BLOG_CATEGORIES, blogPosts, type BlogPost } from '../../data/blogPosts';
import api from '../../services/api';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';

type ListPost = Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'category'> & { date: string; readTime: string };

function mapApiToListPost(row: {
  slug: string;
  title: string;
  excerpt: string;
  display_date: string;
  read_time: string;
  category?: string;
}): ListPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category || 'Ghana',
    date: row.display_date,
    readTime: row.read_time,
  };
}

const Blog: React.FC = () => {
  const { sections } = useCmsPage('blog');
  const seo = resolveCmsSeo(sections, {
    title: 'Solar Resources & Insights | Energy Precisions Ghana',
    description:
      'Practical articles on solar sizing, grid-tied and hybrid systems, and getting accurate quotes in Ghana — from Energy Precisions.',
  });
  const { hero } = sections;
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [posts, setPosts] = useState<ListPost[]>(() =>
    [...blogPosts]
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        date: p.date,
        readTime: p.readTime,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  );

  useEffect(() => {
    let cancelled = false;
    api
      .get('/content/blog')
      .then((res) => {
        const rows = res.data as Array<{
          slug: string;
          title: string;
          excerpt: string;
          display_date: string;
          read_time: string;
          category?: string;
        }>;
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setPosts(rows.map(mapApiToListPost).sort((a, b) => (a.date < b.date ? 1 : -1)));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const featured = posts[0];

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/blog" />
      <PublicPageShell badge={hero.badge} headline={hero.headline} description={hero.description}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }} role="group" aria-label="Filter by category">
          {BLOG_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              selected={activeCategory === cat}
              onSelect={() => setActiveCategory(cat)}
            />
          ))}
        </Stack>

        {featured && activeCategory === 'All' && (
          <Card sx={{ ...publicUi.card, mb: 4, overflow: 'hidden' }}>
            <CardActionArea component={RouterLink} to={`/blog/${featured.slug}`}>
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: colors.blueBlack, color: 'white' }}>
                <Chip label="Featured" size="small" sx={{ bgcolor: colors.green, color: colors.blueBlack, fontWeight: 700, mb: 1.5 }} />
                <Typography sx={{ ...homeUi.title, fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 1 }}>
                  {featured.title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.82)', mb: 2, maxWidth: 640, lineHeight: 1.6 }}>
                  {featured.excerpt}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: colors.green }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Read featured article</Typography>
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </Stack>
              </Box>
            </CardActionArea>
          </Card>
        )}

        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {filtered.map((post) => (
            <Grid item xs={12} md={6} key={post.slug}>
              <Card sx={{ ...publicUi.card, height: '100%' }}>
                <CardActionArea component={RouterLink} to={`/blog/${post.slug}`} sx={{ height: '100%', alignItems: 'stretch' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                      <Chip label={post.category} size="small" sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }} />
                      <Typography variant="caption" sx={publicUi.mutedText}>
                        {post.date} · {post.readTime}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontWeight: 700, color: colors.blueBlack, mb: 1, lineHeight: 1.35 }}>
                      {post.title}
                    </Typography>
                    <Typography sx={{ ...publicUi.mutedText, flexGrow: 1, mb: 2, lineHeight: 1.6 }}>
                      {post.excerpt}
                    </Typography>
                    <Button
                      component="span"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                      sx={{ ...publicUi.inlineLink, alignSelf: 'flex-start', p: 0 }}
                    >
                      Read article
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </PublicPageShell>
    </>
  );
};

export default Blog;

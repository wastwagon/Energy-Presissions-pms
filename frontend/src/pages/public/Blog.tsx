import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Grid, Stack, Box, CircularProgress } from '@mui/material';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import FilterChip from '../../components/public/FilterChip';
import BlogCard, { type BlogCardPost } from '../../components/public/BlogCard';
import { BLOG_CATEGORIES } from '../../data/blogPosts';
import api from '../../services/api';
import { publicUi } from '../../theme/publicUi';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { mapApiBlogListRow, sortBlogPostsNewestFirst, type ApiBlogRow, type BlogListItem } from '../../utils/blogApi';

const Blog: React.FC = () => {
  const { cta } = useGlobalSiteConfig();
  const { sections } = useCmsPage('blog');
  const seo = resolveCmsSeo(sections, {
    title: 'Solar Resources & Insights | Energy Precisions Ghana',
    description:
      'Practical articles on solar sizing, grid-tied and hybrid systems, and getting accurate quotes in Ghana — from Energy Precisions.',
  });
  const { hero } = sections;
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    api
      .get<ApiBlogRow[]>('/content/blog')
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setPosts(sortBlogPostsNewestFirst(rows.map(mapApiBlogListRow)));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const featured = posts[0];
  const gridPosts = activeCategory === 'All' && featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered;

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/blog" />
      <PublicPageShell badge={hero.badge} headline={hero.headline} description={hero.description}>
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
            {BLOG_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat}
                label={cat}
                selected={activeCategory === cat}
                onSelect={() => setActiveCategory(cat)}
              />
            ))}
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={36} />
          </Box>
        ) : loadError ? (
          <Typography sx={{ ...publicUi.mutedText, py: 4, textAlign: 'center' }}>
            Unable to load articles right now. Please try again shortly.
          </Typography>
        ) : posts.length === 0 ? (
          <Typography sx={{ ...publicUi.mutedText, py: 4, textAlign: 'center' }}>
            New articles will appear here soon.
          </Typography>
        ) : (
          <>
            {featured && activeCategory === 'All' && (
              <BlogCard post={featured as BlogCardPost} variant="featured" />
            )}

            {gridPosts.length > 0 ? (
              <Grid container spacing={{ xs: 2, md: 2.5 }}>
                {gridPosts.map((post) => (
                  <Grid item xs={12} sm={6} lg={4} key={post.slug}>
                    <BlogCard post={post as BlogCardPost} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ ...publicUi.mutedText, py: 4, textAlign: 'center' }}>
                No articles in this category yet.
              </Typography>
            )}
          </>
        )}
      </PublicPageShell>
      <PublicStickyMobileCta label={cta.consultation} to={cta.quoteHref} />
    </>
  );
};

export default Blog;

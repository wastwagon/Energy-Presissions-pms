import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Grid, Stack, Box } from '@mui/material';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import FilterChip from '../../components/public/FilterChip';
import BlogCard, { type BlogCardPost } from '../../components/public/BlogCard';
import { BLOG_CATEGORIES, blogPosts, resolveBlogFeaturedImage } from '../../data/blogPosts';
import api from '../../services/api';
import { publicUi } from '../../theme/publicUi';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { SITE_CTA } from '../../data/siteCta';

function mapLocalToListPost(p: (typeof blogPosts)[number]): BlogCardPost {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    readTime: p.readTime,
    featuredImage: p.featuredImage,
  };
}

function mapApiToListPost(row: {
  slug: string;
  title: string;
  excerpt: string;
  display_date: string;
  read_time: string;
  category?: string;
  featured_image?: string;
}): BlogCardPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category || 'Ghana',
    date: row.display_date,
    readTime: row.read_time,
    featuredImage: resolveBlogFeaturedImage(row.slug, row.featured_image),
  };
}

function mergeBlogPosts(apiRows: Array<Parameters<typeof mapApiToListPost>[0]>): BlogCardPost[] {
  const apiBySlug = new Map(apiRows.map((row) => [row.slug, mapApiToListPost(row)]));
  const localSlugs = new Set(blogPosts.map((p) => p.slug));

  const merged: BlogCardPost[] = blogPosts.map((local) => {
    const fromApi = apiBySlug.get(local.slug);
    if (fromApi) return fromApi;
    return mapLocalToListPost(local);
  });

  for (const row of apiRows) {
    if (!localSlugs.has(row.slug)) {
      merged.push(mapApiToListPost(row));
    }
  }

  return merged.sort((a, b) => (a.date < b.date ? 1 : -1));
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
  const [posts, setPosts] = useState<BlogCardPost[]>(() =>
    [...blogPosts].map(mapLocalToListPost).sort((a, b) => (a.date < b.date ? 1 : -1)),
  );

  useEffect(() => {
    let cancelled = false;
    api
      .get('/content/blog')
      .then((res) => {
        const rows = res.data as Array<Parameters<typeof mapApiToListPost>[0]>;
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setPosts(mergeBlogPosts(rows));
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

        {featured && activeCategory === 'All' && <BlogCard post={featured} variant="featured" />}

        {gridPosts.length > 0 ? (
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {gridPosts.map((post) => (
              <Grid item xs={12} sm={6} lg={4} key={post.slug}>
                <BlogCard post={post} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ ...publicUi.mutedText, py: 4, textAlign: 'center' }}>
            No articles in this category yet.
          </Typography>
        )}
      </PublicPageShell>
      <PublicStickyMobileCta label={SITE_CTA.consultation} to={SITE_CTA.quoteHref} />
    </>
  );
};

export default Blog;

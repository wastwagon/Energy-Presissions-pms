import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featuredImage: string;
};

type Props = {
  post: BlogCardPost;
  variant?: 'grid' | 'featured';
};

const BlogCard: React.FC<Props> = ({ post, variant = 'grid' }) => {
  const reducedMotion = usePrefersReducedMotion();
  const imageUrl = resolveMediaUrl(post.featuredImage);
  const isFeatured = variant === 'featured';

  if (isFeatured) {
    return (
      <Card
        component={RouterLink}
        to={`/blog/${post.slug}`}
        sx={{
          ...publicUi.card,
          mb: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:active': { transform: 'scale(0.99)' },
          '@media (hover: hover)': {
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: homeUi.cardShadowHover,
              borderColor: colors.green,
              '& .blog-card-image': { transform: reducedMotion ? 'none' : 'scale(1.04)' },
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '100%', md: '48%' },
            minHeight: { xs: 220, md: 300 },
            overflow: 'hidden',
            bgcolor: colors.gray200,
          }}
        >
          <CardMedia
            component="img"
            image={imageUrl}
            alt={post.title}
            className="blog-card-image"
            sx={{
              width: '100%',
              height: '100%',
              minHeight: { xs: 220, md: 300 },
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
          />
          <Chip
            label="Featured"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: colors.green,
              color: colors.blueBlack,
              fontWeight: 700,
            }}
          />
        </Box>
        <CardContent
          sx={{
            flex: 1,
            p: { xs: 2.5, md: 3.5 },
            bgcolor: colors.blueBlack,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
            <Chip
              label={post.category}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, height: 24 }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', alignSelf: 'center' }}>
              {post.date} · {post.readTime}
            </Typography>
          </Stack>
          <Typography sx={{ ...homeUi.title, fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 1.25, color: 'white' }}>
            {post.title}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.82)', mb: 2.5, maxWidth: 560, lineHeight: 1.65, flexGrow: 1 }}>
            {post.excerpt}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: colors.green }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Read featured article</Typography>
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      component={RouterLink}
      to={`/blog/${post.slug}`}
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
            transform: 'translateY(-4px)',
            boxShadow: homeUi.cardShadowHover,
            borderColor: colors.green,
            '& .blog-card-image': { transform: reducedMotion ? 'none' : 'scale(1.05)' },
            '& .blog-card-cta': { color: colors.greenDark || colors.blueBlack },
          },
        },
      }}
    >
      <Box sx={{ height: { xs: 180, sm: 200 }, overflow: 'hidden', bgcolor: colors.gray200 }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={post.title}
          className="blog-card-image"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.25 }, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
          <Chip label={post.category} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600 }} />
          <Typography variant="caption" sx={{ ...publicUi.mutedText, alignSelf: 'center' }}>
            {post.date} · {post.readTime}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontWeight: 700,
            color: colors.blueBlack,
            mb: 0.75,
            lineHeight: 1.35,
            fontSize: { xs: '0.95rem', md: '1rem' },
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </Typography>
        <Typography
          sx={{
            ...publicUi.mutedText,
            flexGrow: 1,
            mb: 1.5,
            lineHeight: 1.6,
            fontSize: '0.875rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.excerpt}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" className="blog-card-cta" sx={{ color: colors.green, mt: 'auto' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Read article</Typography>
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BlogCard;

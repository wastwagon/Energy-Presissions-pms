import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { blogPosts, type BlogPost } from '../../data/blogPosts';
import api from '../../services/api';

type ListPost = Pick<BlogPost, 'slug' | 'title' | 'excerpt'> & { date: string; readTime: string };

function mapApiToListPost(row: { slug: string; title: string; excerpt: string; display_date: string; read_time: string }): ListPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: row.display_date,
    readTime: row.read_time,
  };
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<ListPost[]>(() =>
    [...blogPosts]
      .map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, date: p.date, readTime: p.readTime }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  );

  useEffect(() => {
    let cancelled = false;
    api
      .get('/content/blog')
      .then((res) => {
        const rows = res.data as Array<{ slug: string; title: string; excerpt: string; display_date: string; read_time: string }>;
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setPosts(rows.map(mapApiToListPost).sort((a, b) => (a.date < b.date ? 1 : -1)));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <Seo
        title="Solar Resources & Insights | Energy Precisions Ghana"
        description="Practical articles on solar sizing, grid-tied and hybrid systems, and getting accurate quotes in Ghana — from Energy Precisions."
        path="/blog"
      />
      <Box
        sx={{
          bgcolor: colors.blueBlack,
          color: 'white',
          py: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Chip
            label="RESOURCES"
            size="small"
            sx={{ bgcolor: colors.green, color: 'white', fontWeight: 700, mb: 1.5 }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.65rem', sm: '1.9rem', md: '2.2rem' },
              fontWeight: 800,
              mb: 1.5,
              lineHeight: 1.15,
            }}
          >
            Solar insights for homes and businesses
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', maxWidth: 560, fontWeight: 400, lineHeight: 1.65, fontSize: { xs: '0.95rem', md: '1rem' } }}>
            Short guides you can trust — no hype, just how we think about design, tariffs, and backup when we
            engineer systems in Ghana.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {posts.map((post) => (
            <Grid item xs={12} md={6} key={post.slug}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                <CardActionArea component={RouterLink} to={`/blog/${post.slug}`} sx={{ height: '100%', alignItems: 'stretch' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        · {post.readTime}
                      </Typography>
                    </Stack>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1, color: colors.blueBlack, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, flexGrow: 1, lineHeight: 1.65 }}>
                      {post.excerpt}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: colors.green, fontWeight: 600 }}>
                      <Typography variant="body2">Read article</Typography>
                      <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Blog;

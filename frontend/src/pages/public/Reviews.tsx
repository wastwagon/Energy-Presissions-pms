import React from 'react';
import { Typography, Grid, Card, CardContent, Button, Stack, Rating } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import GoogleReviewsBand from '../../components/public/GoogleReviewsBand';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { SITE_CTA } from '../../data/siteCta';

const Reviews: React.FC = () => {
  const { sections: homeSections } = useCmsPage('home');
  const { sections } = useCmsPage('reviews');
  const items = homeSections.testimonials?.items || [];
  const seo = resolveCmsSeo(sections, {
    title: 'Client Reviews | Solar Ghana | Energy Precisions',
    description:
      'What residential, commercial and industrial clients say about Energy Precisions solar design, installation and support across Ghana.',
  });
  const { hero } = sections;

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/reviews" />
      <PublicPageShell badge={hero.badge} headline={hero.headline} description={hero.description} heroAlign="center">
        <GoogleReviewsBand />
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {items.map((item) => (
            <Grid item xs={12} md={4} key={`${item.name}-${item.location}`}>
              <Card sx={{ ...publicUi.card, height: '100%' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Rating value={item.rating || 5} readOnly size="small" sx={{ mb: 1.5, color: colors.green }} />
                  <Typography sx={{ ...homeUi.body, ...publicUi.mutedText, mb: 2, fontStyle: 'italic' }}>
                    “{item.text}”
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: colors.blueBlack }}>{item.name}</Typography>
                  <Typography sx={{ ...publicUi.mutedText, fontSize: '0.8125rem' }}>
                    {item.role}
                    {item.location ? ` · ${item.location}` : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: { xs: 4, md: 6 }, textAlign: 'center' }}
        >
          <Typography sx={{ ...publicUi.mutedText, maxWidth: 420 }}>
            Ready to join our clients? Book a free site assessment — no hard sell.
          </Typography>
          <Button
            component={RouterLink}
            to={SITE_CTA.quoteHref}
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3 }}
          >
            {SITE_CTA.consultation}
          </Button>
        </Stack>
      </PublicPageShell>
    </>
  );
};

export default Reviews;

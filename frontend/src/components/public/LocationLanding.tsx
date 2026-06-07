import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Seo } from '../Seo';
import PublicPageHero from './PublicPageHero';
import type { LocationPageData } from '../../data/locationPages';
import { COMPANY } from '../../data/companyContact';
import { SITE_CTA } from '../../data/siteCta';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { localBusinessJsonLd } from '../../utils/jsonLd';

type Props = {
  page: LocationPageData;
};

const LocationLanding: React.FC<Props> = ({ page }) => {
  const path = `/${page.slug}`;
  const jsonLd = {
    ...localBusinessJsonLd(),
    areaServed: { '@type': 'City', name: page.city },
    description: page.description,
  };

  return (
    <Box sx={{ bgcolor: homeUi.pageBg }}>
      <Seo title={page.seoTitle} description={page.seoDescription} path={path} jsonLd={jsonLd} />
      <PublicPageHero badge={page.badge} headline={page.headline} description={page.description}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            component={RouterLink}
            to={`${SITE_CTA.quoteHref}&city=${encodeURIComponent(page.city)}`}
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3 }}
          >
            {SITE_CTA.consultation}
          </Button>
          <Button
            component="a"
            href={COMPANY.phoneHref}
            variant="outlined"
            startIcon={<PhoneIcon />}
            sx={{
              borderColor: 'rgba(255,255,255,0.45)',
              color: 'white',
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            {COMPANY.phoneDisplay}
          </Button>
        </Stack>
      </PublicPageHero>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: publicUi.containerPx }}>
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 4, md: 5 } }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ ...publicUi.card, height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>Why {page.city}?</Typography>
                <List dense disablePadding>
                  {page.highlights.map((h) => (
                    <ListItem key={h} disableGutters sx={{ alignItems: 'flex-start', py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                        <CheckIcon sx={{ fontSize: 18, color: colors.green }} />
                      </ListItemIcon>
                      <ListItemText primary={h} primaryTypographyProps={{ variant: 'body2', sx: publicUi.mutedText }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ ...publicUi.card, height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>Popular in {page.region}</Typography>
                <Stack spacing={1}>
                  {page.services.map((s) => (
                    <Typography key={s} sx={{ ...publicUi.mutedText, fontSize: '0.875rem' }}>
                      · {s}
                    </Typography>
                  ))}
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
                  <Button component={RouterLink} to="/solar-packages" size="small" sx={{ textTransform: 'none', color: colors.blueNavy }}>
                    Hybrid packages
                  </Button>
                  <Button component={RouterLink} to="/portfolio" size="small" sx={{ textTransform: 'none', color: colors.blueNavy }}>
                    View projects
                  </Button>
                  <Button component={RouterLink} to="/solar-estimate" size="small" sx={{ textTransform: 'none', color: colors.blueNavy }}>
                    Size estimator
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ ...publicUi.mutedText, mb: 2, maxWidth: 520, mx: 'auto' }}>
            {COMPANY.officeRegionNote}
          </Typography>
          <Button
            component={RouterLink}
            to={SITE_CTA.quoteHref}
            variant="contained"
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3 }}
          >
            {SITE_CTA.consultation}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LocationLanding;

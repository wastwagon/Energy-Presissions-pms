import React from 'react';
import {
  Box,
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
import PublicPageShell from './PublicPageShell';
import PublicStickyMobileCta from './PublicStickyMobileCta';
import type { LocationPageData } from '../../data/locationPages';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { localBusinessJsonLd } from '../../utils/jsonLd';

type Props = {
  page: LocationPageData;
};

const LocationLanding: React.FC<Props> = ({ page }) => {
  const { contact, cta } = useGlobalSiteConfig();
  const path = `/${page.slug}`;
  const jsonLd = {
    ...localBusinessJsonLd(contact),
    areaServed: { '@type': 'City', name: page.city },
    description: page.description,
  };

  return (
    <>
      <Seo title={page.seoTitle} description={page.seoDescription} path={path} jsonLd={jsonLd} />
      <PublicPageShell
        badge={page.badge}
        headline={page.headline}
        description={page.description}
        heroChildren={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={RouterLink}
              to={`${cta.quoteHref}&city=${encodeURIComponent(page.city)}`}
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3 }}
            >
              {cta.consultation}
            </Button>
            <Button
              component="a"
              href={contact.phoneHref}
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
              {contact.phoneDisplay}
            </Button>
          </Stack>
        }
      >
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
                    <Typography key={s} sx={{ ...publicUi.mutedText }}>
                      · {s}
                    </Typography>
                  ))}
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
                  <Button component={RouterLink} to="/solar-packages" sx={{ textTransform: 'none', color: colors.blueNavy, minHeight: 44 }}>
                    Hybrid packages
                  </Button>
                  <Button component={RouterLink} to="/portfolio" sx={{ textTransform: 'none', color: colors.blueNavy, minHeight: 44 }}>
                    View projects
                  </Button>
                  <Button component={RouterLink} to="/solar-estimate" sx={{ textTransform: 'none', color: colors.blueNavy, minHeight: 44 }}>
                    Size estimator
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ ...publicUi.mutedText, mb: 2, maxWidth: 520, mx: 'auto' }}>
            {contact.officeRegionNote}
          </Typography>
          <Button
            component={RouterLink}
            to={cta.quoteHref}
            variant="contained"
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3 }}
          >
            {cta.consultation}
          </Button>
        </Box>
      </PublicPageShell>
      <PublicStickyMobileCta label={cta.consultation} to={cta.quoteHref} />
    </>
  );
};

export default LocationLanding;

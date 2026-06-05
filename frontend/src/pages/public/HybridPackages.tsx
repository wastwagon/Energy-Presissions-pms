import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Bolt as BoltIcon,
  SolarPower as SolarIcon,
} from '@mui/icons-material';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { COMPANY } from '../../data/companyContact';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import {
  HYBRID_PACKAGES,
  LOAD_CEILING_HELP,
  formatGhs,
} from '../../data/hybridPackages';

const isExternalLink = (path: string) =>
  path.startsWith('http') || path.startsWith('tel:') || path.startsWith('mailto:');

const HybridPackages: React.FC = () => {
  const { sections } = useCmsPage('packages');
  const seo = resolveCmsSeo(sections, {
    title: 'Hybrid Lithium Solar Packages Ghana | Energy Precisions',
    description:
      'Turnkey 6.5–20 kVA hybrid lithium solar packages from our Accra office — panels, installation, monitoring and competitive GHS pricing across Ghana.',
  });
  const { hero, packages_section: packagesSection, reading_guide: readingGuide, why_section: whySection } = sections;
  const [expanded, setExpanded] = useState<string | false>(HYBRID_PACKAGES[0]?.id ?? false);

  const secondaryCtaExternal = isExternalLink(hero.secondary_cta_link);

  return (
    <Box>
      <Seo title={seo.title} description={seo.description} path="/solar-packages" />

      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
          color: 'white',
          py: { xs: 5, md: 7 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label={hero.badge}
                sx={{
                  bgcolor: colors.green,
                  color: 'white',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: '0.7rem',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.85rem', md: '2.5rem' },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.12,
                }}
              >
                {hero.headline}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, maxWidth: 560, mb: 3 }}
              >
                {hero.description}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={hero.primary_cta_link}
                  sx={{
                    bgcolor: colors.green,
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3,
                    '&:hover': { bgcolor: colors.greenDark },
                  }}
                >
                  {hero.primary_cta_text}
                </Button>
                <Button
                  variant="outlined"
                  component={secondaryCtaExternal ? 'a' : RouterLink}
                  {...(secondaryCtaExternal
                    ? { href: hero.secondary_cta_link }
                    : { to: hero.secondary_cta_link })}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': { borderColor: colors.green, bgcolor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  {hero.secondary_cta_text}
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Box
                component="img"
                src={COMPANY.logoSrc}
                alt={COMPANY.logoAlt}
                sx={{
                  maxWidth: { xs: 220, md: 280 },
                  width: '100%',
                  height: 'auto',
                  filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Package grid */}
      <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              color: colors.blueBlack,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '1.85rem' },
            }}
          >
            {packagesSection.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: colors.gray600, mb: 3, maxWidth: 640, mx: 'auto' }}
          >
            {packagesSection.subtitle}
          </Typography>

          <Box
            sx={{
              maxWidth: 720,
              mx: 'auto',
              mb: 4,
              p: 2,
              borderRadius: 2,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: colors.gray200,
              borderLeft: `4px solid ${colors.blueBlack}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.blueBlack, mb: 1 }}>
              {readingGuide.title}
            </Typography>
            <List dense disablePadding>
              {(readingGuide.points || []).map((point) => (
                <ListItem key={point} disableGutters sx={{ py: 0.25, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                    <CheckIcon sx={{ fontSize: 16, color: colors.green }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={point}
                    primaryTypographyProps={{ variant: 'body2', color: colors.gray600 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Grid container spacing={2} alignItems="stretch">
            {HYBRID_PACKAGES.map((pkg) => (
              <Grid item xs={12} sm={6} lg={4} key={pkg.id}>
                <Card
                  sx={{
                    height: '100%',
                    minHeight: { xs: 'auto', lg: 520 },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: colors.gray200,
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    '&:hover': {
                      borderColor: colors.green,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 100%)`,
                      color: 'white',
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant="overline" sx={{ color: colors.green, fontWeight: 700 }}>
                        {pkg.badge}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {pkg.kvaLabel}
                      </Typography>
                      {pkg.inverterHeadroom ? (
                        <Chip
                          label={pkg.inverterHeadroom}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: '#ffd54f',
                            color: colors.blueBlack,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      ) : null}
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                        Planned continuous load ~{pkg.maxWatts} W
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.65rem', lineHeight: 1.3 }}>
                        {LOAD_CEILING_HELP}
                      </Typography>
                    </Box>
                    <BoltIcon sx={{ color: colors.green, fontSize: 28, opacity: 0.9 }} />
                  </Box>
                  <Box sx={{ bgcolor: colors.green, color: colors.blueBlack, px: 2, py: 1.25 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                      From
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                      {formatGhs(pkg.priceGhs)}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, py: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.78rem',
                        lineHeight: 1.45,
                        color: colors.gray600,
                        bgcolor: 'rgba(0,230,118,0.08)',
                        borderLeft: `3px solid ${colors.green}`,
                        pl: 1.25,
                        py: 1,
                        mb: 1.5,
                      }}
                    >
                      {pkg.customerNote}
                    </Typography>
                    {pkg.highlights.map((h) => (
                      <Chip
                        key={h}
                        label={h}
                        size="small"
                        sx={{ mb: 1.5, mr: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    ))}
                    <Accordion
                      expanded={expanded === pkg.id}
                      onChange={(_, isExp) => setExpanded(isExp ? pkg.id : false)}
                      disableGutters
                      elevation={0}
                      sx={{
                        bgcolor: 'transparent',
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 40 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          What&apos;s included
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 0, pt: 0 }}>
                        <List dense disablePadding>
                          {pkg.components.map((line) => (
                            <ListItem key={line} disableGutters sx={{ py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <CheckIcon sx={{ fontSize: 16, color: colors.green }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={line}
                                primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Typography variant="caption" sx={{ color: colors.gray600, display: 'block', mt: 1 }}>
                          <strong>Typical loads (stagger heavy items):</strong> {pkg.appliances}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to={`/contact?action=quote&topic=package&message=${encodeURIComponent(
                        `I'm interested in the ${pkg.kvaLabel} hybrid package (${formatGhs(pkg.priceGhs)}).`
                      )}`}
                      sx={{
                        borderColor: colors.blueBlack,
                        color: colors.blueBlack,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { borderColor: colors.green, bgcolor: 'rgba(0,230,118,0.06)' },
                      }}
                    >
                      Get quote for this package
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why EP + contact */}
      <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontWeight: 800, color: colors.blueBlack, mb: 2, fontSize: '1.5rem' }}>
                {whySection.title}
              </Typography>
              <Grid container spacing={2}>
                {(whySection.features || []).map((feature) => (
                  <Grid item xs={12} sm={6} key={feature.title}>
                    <Box display="flex" gap={1.5}>
                      <SolarIcon sx={{ color: colors.green }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <List sx={{ mt: 2 }}>
                {(whySection.footer_points || []).map((point) => (
                  <ListItem key={point} disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ color: colors.green, fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={point} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="caption" sx={{ color: colors.gray600, display: 'block', mt: 2 }}>
                {whySection.warranty_note}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.gray600, display: 'block', mt: 0.5 }}>
                {whySection.validity_note}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `2px solid ${colors.green}`,
                  bgcolor: colors.offWhite,
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    component="img"
                    src={COMPANY.logoSrc}
                    alt={COMPANY.logoAlt}
                    sx={{ height: 48, width: 'auto' }}
                  />
                  <Typography variant="h6" fontWeight={800} color={colors.blueBlack}>
                    {COMPANY.name}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ color: colors.green, fontWeight: 700, mb: 0.5 }}>
                  {COMPANY.officeHeading.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {COMPANY.addressFull}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.55 }}>
                  {COMPANY.officeRegionNote}
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon sx={{ color: colors.green }} />
                    <Typography
                      component="a"
                      href={COMPANY.phoneHref}
                      variant="body2"
                      sx={{ color: colors.blueBlack, textDecoration: 'none', fontWeight: 600 }}
                    >
                      {COMPANY.phoneDisplay}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon sx={{ color: colors.green }} />
                    <Typography
                      component="a"
                      href={`mailto:${COMPANY.emailSales}`}
                      variant="body2"
                      sx={{ color: colors.blueBlack, textDecoration: 'none' }}
                    >
                      {COMPANY.emailSales}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <LocationIcon sx={{ color: colors.green, mt: 0.25 }} />
                    <Typography variant="body2" color="text.secondary">
                      {COMPANY.addressFull}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  component={RouterLink}
                  to="/contact?action=quote&topic=package"
                  sx={{
                    mt: 3,
                    bgcolor: colors.green,
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: colors.greenDark },
                  }}
                >
                  {whySection.contact_cta_text}
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HybridPackages;

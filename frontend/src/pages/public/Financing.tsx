import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Handshake as HandshakeIcon,
  CheckCircleOutline as CheckIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';

const Financing: React.FC = () => {
  return (
    <Box>
      <Seo
        title="Solar Financing Ghana | Payment Options | Energy Precisions"
        description="Financing and staged payment paths for solar projects in Ghana. Transparent quotes, engineering-led sizing and maintenance — Energy Precisions."
        path="/financing"
      />
      <Box
        sx={{
          bgcolor: colors.blueBlack,
          color: 'white',
          py: { xs: 5, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="SOLAR FOR EVERYONE"
                sx={{
                  bgcolor: colors.green,
                  color: 'white',
                  fontWeight: 700,
                  mb: 1.5,
                  px: 1.75,
                  height: 'auto',
                  fontSize: '0.7rem',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.35rem' },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.15,
                }}
              >
                Financing &amp; payment paths that fit your project
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.65,
                  fontWeight: 400,
                  mb: 2.5,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                }}
              >
                We are rolling out structured financing and staged-payment options alongside our turnkey
                design, installation, and maintenance. Tell us about your site and load profile—we will map
                the clearest path forward and only recommend what we can actually deliver.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/contact?action=quote"
                  variant="contained"
                  size="medium"
                  sx={{
                    bgcolor: colors.green,
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2.5,
                    '&:hover': { bgcolor: colors.greenDark },
                  }}
                >
                  Request a financing conversation
                </Button>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="outlined"
                  size="medium"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  General contact
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <HandshakeIcon sx={{ color: colors.green }} />
                      <Typography variant="h6" fontWeight={700}>
                        How we work with you
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                      Clear proposal, transparent line items, and a maintenance story after commissioning—so
                      lenders and finance partners (when engaged) see a serious, documented project.
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <AccountBalanceIcon sx={{ color: colors.green }} />
                      <Typography variant="h6" fontWeight={700}>
                        What we are building toward
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                      Partnerships with banks and asset financiers are part of our roadmap. Until each
                      program is live, we will not advertise rates or products we cannot honour.
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Typography variant="h2" fontWeight={800} sx={{ mb: 1.5, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
          Today: practical ways to move your project forward
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '48rem', lineHeight: 1.65 }}>
          Many customers combine equipment purchases from our shop with a custom engineered install. We can
          discuss milestones, retainers, and documentation you need for your own financing—without promising
          third-party approval we do not control.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Typical next steps
                </Typography>
                <List dense disablePadding>
                  {[
                    'Site assessment and load / tariff review',
                    'Engineering-led system sizing and bill-of-materials',
                    'Formal quote with clear phases (equipment, install, commissioning)',
                    'Optional maintenance and monitoring plan after handover',
                  ].map((text) => (
                    <ListItem key={text} disableGutters sx={{ alignItems: 'flex-start', py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                        <CheckIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={text} primaryTypographyProps={{ variant: 'body2', lineHeight: 1.7 }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'grey.50' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PhoneIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Talk to the team
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                  For residential, commercial, agricultural, or hybrid sites, we start with your goals and
                  constraints—then align equipment and installation scope before any financing discussion.
                </Typography>
                <Button component={RouterLink} to="/contact?action=quote" variant="contained" color="primary" size="medium" sx={{ textTransform: 'none' }}>
                  Start with a quote request
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Financing;

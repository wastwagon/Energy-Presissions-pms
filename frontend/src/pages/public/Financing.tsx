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
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';

const HERO_CARD_ICONS = [HandshakeIcon, AccountBalanceIcon];

const Financing: React.FC = () => {
  const { sections } = useCmsPage('financing');
  const seo = resolveCmsSeo(sections, {
    title: 'Solar Financing Ghana | Payment Options | Energy Precisions',
    description:
      'Financing and staged payment paths for solar projects in Ghana. Transparent quotes, engineering-led sizing and maintenance — Energy Precisions.',
  });
  const { hero, hero_cards: heroCards, content } = sections;

  return (
    <Box>
      <Seo title={seo.title} description={seo.description} path="/financing" />
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
                label={hero.badge}
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
                {hero.headline}
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
                {hero.description}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to={hero.primary_cta_link}
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
                  {hero.primary_cta_text}
                </Button>
                <Button
                  component={RouterLink}
                  to={hero.secondary_cta_link}
                  variant="outlined"
                  size="medium"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  {hero.secondary_cta_text}
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                {(heroCards || []).map((card, index) => {
                  const Icon = HERO_CARD_ICONS[index] || HandshakeIcon;
                  return (
                    <Card
                      key={card.title}
                      sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Icon sx={{ color: colors.green }} />
                          <Typography variant="h6" fontWeight={700}>
                            {card.title}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                          {card.body}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Typography variant="h2" fontWeight={800} sx={{ mb: 1.5, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
          {content.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '48rem', lineHeight: 1.65 }}>
          {content.subtitle}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  {content.steps_title}
                </Typography>
                <List dense disablePadding>
                  {(content.steps || []).map((text) => (
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
                    {content.talk_title}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                  {content.talk_body}
                </Typography>
                <Button
                  component={RouterLink}
                  to={content.talk_cta_link}
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{ textTransform: 'none' }}
                >
                  {content.talk_cta_text}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card variant="outlined" sx={{ mt: 4, borderColor: colors.green, bgcolor: 'rgba(0, 230, 118, 0.04)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
              {content.payg_title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
              {content.payg_body}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {content.payg_footer}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Financing;

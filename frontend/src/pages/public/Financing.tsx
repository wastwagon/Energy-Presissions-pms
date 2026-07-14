import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
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
import PublicPageShell from '../../components/public/PublicPageShell';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import FinancingPaymentEstimate from '../../components/public/FinancingPaymentEstimate';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';

const HERO_CARD_ICONS = [HandshakeIcon, AccountBalanceIcon];

const Financing: React.FC = () => {
  const { sections } = useCmsPage('financing');
  const { cta, warrantySummary } = useGlobalSiteConfig();
  const seo = resolveCmsSeo(sections, {
    title: 'Solar Financing Ghana | Payment Options | Energy Precisions',
    description:
      'Financing and staged payment paths for solar projects in Ghana. Transparent quotes, engineering-led sizing and maintenance — Energy Precisions.',
  });
  const { hero, hero_cards: heroCards, content } = sections;

  const heroCardsBand =
    (heroCards || []).length > 0 ? (
      <Container maxWidth="lg" sx={{ px: publicUi.containerPx, pt: { xs: 3, md: 4 }, pb: 0 }}>
        <Grid container spacing={2}>
          {(heroCards || []).map((card, index) => {
            const Icon = HERO_CARD_ICONS[index] || HandshakeIcon;
            return (
              <Grid item xs={12} md={6} key={card.title}>
                <Card sx={{ ...publicUi.card, height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Icon sx={{ color: colors.green }} />
                      <Typography sx={{ fontWeight: 700 }}>{card.title}</Typography>
                    </Stack>
                    <Typography sx={{ ...publicUi.mutedText }}>{card.body}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    ) : null;

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/financing" />
      <PublicPageShell
        badge={hero.badge}
        headline={hero.headline}
        description={hero.description}
        beforeContent={heroCardsBand}
        heroChildren={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={RouterLink}
              to={hero.primary_cta_link}
              variant="contained"
              sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 2.5 }}
            >
              {hero.primary_cta_text}
            </Button>
            <Button
              component={RouterLink}
              to={hero.secondary_cta_link}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.45)',
                color: 'white',
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              {hero.secondary_cta_text}
            </Button>
          </Stack>
        }
      >
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
                  sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
                >
                  {content.talk_cta_text}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <FinancingPaymentEstimate
          title={content.payment_calculator_title}
          subtitle={content.payment_calculator_subtitle}
        />

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

        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
              {warrantySummary.headline}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1 }}>
              {warrantySummary.workmanship}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
              {warrantySummary.equipment}
            </Typography>
            <Button
              component={RouterLink}
              to={warrantySummary.details_path}
              size="small"
              sx={{ textTransform: 'none', px: 0 }}
            >
              Read full warranty policy
            </Button>
          </CardContent>
        </Card>
      </PublicPageShell>
      <PublicStickyMobileCta label={cta.consultation} to={cta.quoteHref} />
    </>
  );
};

export default Financing;

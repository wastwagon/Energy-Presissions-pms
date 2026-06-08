import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Stack } from '@mui/material';
import {
  CardGiftcard as GiftIcon,
  Groups as GroupsIcon,
  CheckCircle as CheckIcon,
  Share as ShareIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import {
  buildWhatsAppShareUrl,
  REFERRAL_LEAD_WHATSAPP_TEMPLATE,
  REFERRAL_WHATSAPP_MESSAGE,
} from '../../utils/whatsappShare';

const ReferralProgram: React.FC = () => {
  const { sections } = useCmsPage('referral');
  const seo = resolveCmsSeo(sections, {
    title: 'Solar Champions Referral Program | Energy Precisions',
    description:
      'Refer homes and businesses to Energy Precisions for solar in Ghana. Ask about our referral rewards for successful installations.',
  });
  const { hero } = sections;

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/referral" />
      <PublicPageShell
        badge={hero.badge}
        headline={hero.headline}
        description={hero.description}
        heroAlign="center"
        contentMaxWidth="lg"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/contact?action=quote&topic=referral"
            variant="contained"
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3 }}
          >
            Submit a referral
          </Button>
          <Button
            component="a"
            href={buildWhatsAppShareUrl(REFERRAL_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<ChatIcon />}
            sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget, px: 3 }}
          >
            Share on WhatsApp
          </Button>
        </Stack>

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
          {[
            {
              icon: <GiftIcon sx={{ fontSize: 32, color: colors.green }} />,
              title: 'Earn rewards',
              body: 'Successful referrals that lead to commissioned installations may qualify for rewards — terms confirmed with you directly.',
            },
            {
              icon: <GroupsIcon sx={{ fontSize: 32, color: colors.green }} />,
              title: 'Help others go solar',
              body: 'Introduce homes, SMEs, or facilities that need engineering-led solar — we handle survey, design, and installation.',
            },
            {
              icon: <ShareIcon sx={{ fontSize: 32, color: colors.green }} />,
              title: 'Easy to share',
              body: 'Use WhatsApp to forward our message template, or submit a lead through the contact form with topic “referral”.',
            },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Card sx={{ ...publicUi.card, height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{item.title}</Typography>
                  <Typography sx={{ ...publicUi.mutedText, fontSize: '0.875rem', lineHeight: 1.6 }}>{item.body}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ ...publicUi.card, bgcolor: colors.blueBlack, color: 'white' }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
              How it works
            </Typography>
            <Stack spacing={1.5}>
              {[
                'Share a contact who is interested in solar (home, business, or community project).',
                'We reach out for a site survey and engineered proposal — no pressure on your contact.',
                'If they proceed to a commissioned installation, we confirm any referral reward with you.',
              ].map((step) => (
                <Stack key={step} direction="row" spacing={1.5} alignItems="flex-start">
                  <CheckIcon sx={{ color: colors.green, fontSize: 20, mt: 0.25 }} />
                  <Typography sx={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>{step}</Typography>
                </Stack>
              ))}
            </Stack>
            <Button
              component="a"
              href={buildWhatsAppShareUrl(REFERRAL_LEAD_WHATSAPP_TEMPLATE)}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{ ...publicUi.primaryButton, mt: 3 }}
            >
              WhatsApp a lead to us
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button component={RouterLink} to="/contact?action=quote&topic=referral" variant="outlined" sx={{ ...publicUi.secondaryButton, px: 3 }}>
            Or use the referral form
          </Button>
        </Box>
      </PublicPageShell>
    </>
  );
};

export default ReferralProgram;

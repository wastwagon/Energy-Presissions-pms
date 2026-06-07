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
import {
  buildWhatsAppShareUrl,
  REFERRAL_LEAD_WHATSAPP_TEMPLATE,
  REFERRAL_WHATSAPP_MESSAGE,
} from '../../utils/whatsappShare';

const ReferralProgram: React.FC = () => (
  <>
    <Seo
      title="Solar Champions Referral Program | Energy Precisions"
      description="Refer homes and businesses to Energy Precisions for solar in Ghana. Ask about our referral rewards for successful installations."
      path="/referral"
    />
    <PublicPageShell
      badge="Solar champions"
      headline="Referral program"
      description="Help friends, family, and businesses go solar. Share a lead today — we confirm eligibility and reward terms with you directly."
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
          Ask on WhatsApp
        </Button>
        <Button
          component="a"
          href={buildWhatsAppShareUrl(REFERRAL_LEAD_WHATSAPP_TEMPLATE)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<ShareIcon />}
          sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget, px: 3 }}
        >
          Share lead template
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {[
          {
            icon: <GiftIcon sx={{ fontSize: 40, color: colors.green, mb: 1 }} />,
            title: 'How it works',
            body: 'You introduce a serious prospect. We assess the site, issue a quote, and if they proceed to installation, your referral is logged for reward settlement.',
          },
          {
            icon: <GroupsIcon sx={{ fontSize: 40, color: colors.green, mb: 1 }} />,
            title: 'Who can refer',
            body: 'Past customers, partners, and community advocates. Commercial introducers should mention company details for procurement or ESG alignment.',
          },
          {
            icon: <CheckIcon sx={{ fontSize: 40, color: colors.green, mb: 1 }} />,
            title: 'Fair & transparent',
            body: 'Rewards depend on project size and margin — no fixed amount promised here. We reply with written terms after your first referral.',
          },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Card sx={{ ...publicUi.card, height: '100%' }}>
              <CardContent>
                {item.icon}
                <Typography sx={{ fontWeight: 700, mb: 1 }}>{item.title}</Typography>
                <Typography sx={{ ...publicUi.mutedText, fontSize: '0.875rem' }}>{item.body}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack alignItems="center" sx={{ mt: 5 }}>
        <Button component={RouterLink} to="/contact?topic=referral" variant="outlined" sx={{ ...publicUi.secondaryButton, px: 3 }}>
          Questions? Contact us
        </Button>
      </Stack>
    </PublicPageShell>
  </>
);

export default ReferralProgram;

import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Stack, Chip } from '@mui/material';
import {
  CardGiftcard as GiftIcon,
  Groups as GroupsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';

const ReferralProgram: React.FC = () => {
  return (
    <Box>
      <Seo
        title="Solar Champions Referral Program | Energy Precisions"
        description="Refer homes and businesses to Energy Precisions for solar in Ghana. Ask about our referral rewards for successful installations."
        path="/referral"
      />
      <Box sx={{ bgcolor: colors.blueBlack, color: 'white', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="md">
          <Chip label="SOLAR CHAMPIONS" sx={{ bgcolor: colors.green, color: 'white', fontWeight: 700, mb: 2 }} />
          <Typography variant="h1" sx={{ fontSize: { xs: '1.65rem', md: '2rem' }, fontWeight: 800, mb: 2 }}>
            Referral program
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, mb: 2 }}>
            Help friends, family, and businesses go solar with a team that engineers every system. We are
            formalising referral rewards for successful projects — share a lead today and we will confirm
            eligibility and terms with you directly.
          </Typography>
          <Button
            component={RouterLink}
            to="/contact?action=quote&topic=referral"
            variant="contained"
            size="large"
            sx={{ bgcolor: colors.green, color: 'white', textTransform: 'none', fontWeight: 700, px: 3 }}
          >
            Submit a referral
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', border: `1px solid ${colors.gray200}`, borderRadius: 2 }}>
              <CardContent>
                <GiftIcon sx={{ fontSize: 40, color: colors.green, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  How it works
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  You introduce a serious prospect (home, farm, or business). We assess the site, issue a quote,
                  and if they proceed to installation, your referral is logged for reward settlement under our
                  current policy.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', border: `1px solid ${colors.gray200}`, borderRadius: 2 }}>
              <CardContent>
                <GroupsIcon sx={{ fontSize: 40, color: colors.green, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Who can refer
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  Past customers, partners, and community advocates. Commercial introducers should mention
                  company details so we can align with your procurement or ESG reporting if needed.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', border: `1px solid ${colors.gray200}`, borderRadius: 2 }}>
              <CardContent>
                <CheckIcon sx={{ fontSize: 40, color: colors.green, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Fair & transparent
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  Rewards depend on project size and margin — no promise of a fixed amount on this page. We will
                  reply with written terms after your first referral.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Stack alignItems="center" sx={{ mt: 5 }}>
          <Button component={RouterLink} to="/contact?topic=referral" variant="outlined" size="large" sx={{ textTransform: 'none' }}>
            Questions? Contact us
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default ReferralProgram;

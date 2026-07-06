import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Engineering as EngineeringIcon,
  CardGiftcard as ReferralIcon,
  RateReview as ReviewsIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { trackPurchase } from '../../utils/analytics';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';

const nextStepSx = {
  ...publicUi.secondaryButton,
  ...homeUi.touchTarget,
  justifyContent: 'flex-start',
  px: 2,
  py: 1.5,
  textAlign: 'left' as const,
};

const CheckoutSuccess: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { sections } = useCmsPage('checkout_success');
  const seo = resolveCmsSeo(sections, {
    title: 'Thank you for your order | Energy Precisions',
    description: 'Your Energy Precisions order confirmation.',
  });
  const { hero, confirmation_body: confirmationBody, next_steps_title: nextStepsTitle } = sections;
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const purchaseSent = useRef(false);

  const verifyOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payments/paystack/verify/${orderNumber}`);

      if (response.data.verified) {
        const oc = response.data.order_confirmation;
        if (oc) {
          setOrder(oc);
        } else {
          setError('Payment verified but order summary is unavailable. Check your email or contact support.');
        }
      } else {
        setError('Payment verification failed. Please contact support if payment was deducted.');
      }
    } catch (err: any) {
      console.error('Error verifying order:', err);
      setError('Unable to verify order. Please contact support.');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (orderNumber) {
      verifyOrder();
    } else {
      setError('No order number provided');
      setLoading(false);
    }
  }, [orderNumber, verifyOrder]);

  useEffect(() => {
    if (order && order.payment_status === 'paid') {
      clearCart();
    }
  }, [order, clearCart]);

  useEffect(() => {
    if (!order || purchaseSent.current) return;
    if (order.payment_status !== 'paid') return;
    const tid = String(order.order_number ?? order.id ?? '');
    const value = Number(order.total_amount);
    if (!tid) return;
    purchaseSent.current = true;
    trackPurchase({
      transaction_id: tid,
      value: Number.isFinite(value) ? value : 0,
      currency: 'GHS',
    });
  }, [order]);

  if (loading) {
    return (
      <PublicPageShell badge={hero.badge} headline="Confirming payment" description="Please wait while we verify your order.">
        <Box textAlign="center" py={4}>
          <CircularProgress sx={{ color: colors.green }} />
          <Typography sx={{ mt: 2, ...publicUi.mutedText }}>Verifying your payment…</Typography>
        </Box>
      </PublicPageShell>
    );
  }

  if (error) {
    return (
      <>
        <Seo title="Order verification" description="Payment verification issue." path="/checkout/success" noIndex />
        <PublicPageShell badge={hero.badge} headline="Verification issue" description="We could not confirm your payment automatically.">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            component={RouterLink}
            to="/contact"
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
          >
            Contact support
          </Button>
        </PublicPageShell>
      </>
    );
  }

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/checkout/success" noIndex />
      <PublicPageShell
        badge={hero.badge}
        headline={hero.headline}
        description={
          order?.order_number
            ? `Order ${order.order_number} — ${hero.description}`
            : hero.description
        }
        heroAlign="center"
      >
        <Card sx={{ ...publicUi.card, maxWidth: 640, mx: 'auto' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: { xs: 52, md: 56 }, color: colors.green, mb: 1.5 }} />
            <Typography sx={{ ...publicUi.mutedText, mb: 3, lineHeight: 1.65 }}>
              {confirmationBody ||
                'A confirmation email is on its way. Our team will update you on dispatch and delivery.'}
            </Typography>

            {order && (
              <Box sx={{ bgcolor: colors.offWhite, p: 2, borderRadius: homeUi.innerRadius, mb: 3, textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Order summary</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    GHS {order.total_amount?.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Status</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.greenDark }}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </Typography>
                </Box>
              </Box>
            )}

            <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '0.9375rem', textAlign: 'left' }}>
              {nextStepsTitle || "What's next?"}
            </Typography>
            <Stack spacing={1.25} sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/contact?action=quote&topic=installation"
                startIcon={<EngineeringIcon />}
                sx={nextStepSx}
              >
                Book installation
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/reviews"
                startIcon={<ReviewsIcon />}
                sx={nextStepSx}
              >
                Read client reviews
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/referral"
                startIcon={<ReferralIcon />}
                sx={nextStepSx}
              >
                Refer & earn
              </Button>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="center"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <Button
                variant="contained"
                component={RouterLink}
                to="/shop"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
              >
                Continue shopping
              </Button>
              <Button
                variant="text"
                component={RouterLink}
                to="/contact"
                sx={{ textTransform: 'none', color: colors.blueNavy, ...homeUi.touchTarget }}
              >
                Need help?
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </PublicPageShell>

      {isMobile && (
        <PublicStickyMobileCta label="Continue shopping" to="/shop" />
      )}
    </>
  );
};

export default CheckoutSuccess;

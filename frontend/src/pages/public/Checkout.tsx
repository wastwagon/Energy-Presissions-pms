import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  MobileStepper,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  Alert,
  Link,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Lock as LockIcon,
  VerifiedUser as VerifiedIcon,
  LocalShipping as ShippingIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { catalogLineUnitPrice } from '../../utils/catalogPrice';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { trackBeginCheckout } from '../../utils/analytics';
import { formatApiErrorDetail } from '../../utils/apiErrorMessage';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';
import { hapticTap } from '../../utils/haptics';
import { mobileCheckoutBarBottom } from '../../utils/mobileChrome';

const steps = ['Shipping', 'Payment', 'Done'];
const stepLabelsDesktop = ['Shipping Information', 'Payment', 'Confirmation'];

const paymentOptionSx = {
  m: 0,
  py: 1.25,
  px: 0.5,
  minHeight: 48,
  alignItems: 'flex-start' as const,
  width: '100%',
  borderRadius: 2,
  '&:hover': { bgcolor: 'rgba(0, 230, 118, 0.06)' },
};

const Checkout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cartItems, cartTotal, clearCart } = useCart();
  const { sections } = useCmsPage('checkout');
  const seo = resolveCmsSeo(sections, {
    title: 'Checkout | Energy Precisions',
    description: 'Shipping, payment and order confirmation for Energy Precisions.',
  });
  const { hero, empty_state: emptyState } = sections;
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingNote, setShippingNote] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (cartTotal <= 0) {
        setShippingCost(0);
        setShippingNote(null);
        return;
      }
      try {
        const res = await api.get('/ecommerce/shipping-estimate', {
          params: { subtotal: cartTotal },
        });
        setShippingCost(Number(res.data.shipping_cost) || 0);
        const th = res.data.free_shipping_threshold_ghs;
        if (th != null && cartTotal >= th) {
          setShippingNote(`Free shipping on orders over GHS ${Number(th).toLocaleString()}`);
        } else if (th != null && Number(res.data.flat_rate_ghs) > 0) {
          setShippingNote(`Free shipping from GHS ${Number(th).toLocaleString()}`);
        } else {
          setShippingNote(null);
        }
      } catch {
        setShippingCost(0);
        setShippingNote(null);
      }
    };
    load();
  }, [cartTotal]);

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
  });

  const [billingSame, setBillingSame] = useState(true);
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const beginCheckoutTracked = useRef(false);

  useEffect(() => {
    if (!appliedCouponCode.trim() || cartTotal <= 0) {
      if (!appliedCouponCode.trim()) {
        setAppliedDiscount(0);
      }
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.post('/ecommerce/coupons/validate', {
          code: appliedCouponCode,
          amount: cartTotal,
        });
        if (!cancelled) {
          setAppliedDiscount(Number(res.data.discount_amount) || 0);
          setCouponError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setAppliedCouponCode('');
          setAppliedDiscount(0);
          const msg = e.response?.data?.detail;
          setCouponError(typeof msg === 'string' ? msg : 'Coupon no longer valid for this cart.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartTotal, appliedCouponCode]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponApplying(true);
    setCouponError(null);
    try {
      const res = await api.post('/ecommerce/coupons/validate', { code, amount: cartTotal });
      setAppliedCouponCode(code);
      setAppliedDiscount(Number(res.data.discount_amount) || 0);
      setCouponInput('');
    } catch (e: any) {
      setAppliedCouponCode('');
      setAppliedDiscount(0);
      const msg = e.response?.data?.detail;
      setCouponError(typeof msg === 'string' ? msg : 'Invalid coupon code');
    } finally {
      setCouponApplying(false);
    }
  };

  const clearCoupon = () => {
    setAppliedCouponCode('');
    setAppliedDiscount(0);
    setCouponInput('');
    setCouponError(null);
  };

  useEffect(() => {
    if (cartItems.length === 0 || beginCheckoutTracked.current) return;
    beginCheckoutTracked.current = true;
    const items = cartItems.map((item) => {
      const p = item.product;
      const price = p ? catalogLineUnitPrice(p) : 0;
      return {
        item_id: String(item.product_id),
        item_name: p?.name || 'Product',
        price,
        quantity: item.quantity,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const value = Math.max(0, subtotal - appliedDiscount) + shippingCost;
    trackBeginCheckout(items, value);
  }, [cartItems, appliedDiscount, shippingCost]);

  if (cartItems.length === 0) {
    return (
      <>
        <Seo title={seo.title} description={seo.description} path="/checkout" noIndex />
        <PublicPageShell badge={hero.badge} headline={hero.headline} description={hero.description}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {emptyState?.title || 'Add products from our shop before checkout.'}
          </Alert>
          <Button
            variant="contained"
            component={RouterLink}
            to="/shop"
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
          >
            {emptyState?.cta_text || 'Browse shop'}
          </Button>
        </PublicPageShell>
      </>
    );
  }

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo({ ...shippingInfo, [field]: value });
    if (billingSame && field !== 'email') {
      setBillingInfo({ ...billingInfo, [field]: value });
    }
  };

  const handleNext = async () => {
    hapticTap();
    if (activeStep === 0) {
      // Validate shipping info
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email ||
          !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
        setError('Please fill in all required fields');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Create order and proceed to payment
      await handleCreateOrder();
    }
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create order
      const orderData = {
        customer_email: shippingInfo.email,
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_phone: shippingInfo.phone,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product?.name || 'Product',
          product_sku: '', // SKU not available in current product type
          quantity: item.quantity,
          unit_price: catalogLineUnitPrice(item.product),
        })),
        shipping_address: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          region: shippingInfo.region,
          postalCode: shippingInfo.postalCode,
        },
        billing_address: billingSame ? undefined : {
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          email: billingInfo.email,
          address: billingInfo.address,
          city: billingInfo.city,
          region: billingInfo.region,
          postalCode: billingInfo.postalCode,
        },
        shipping_method: 'standard',
        shipping_cost: 0,
        discount_amount: 0,
        coupon_code: appliedCouponCode.trim() || undefined,
        payment_method: paymentMethod === 'paystack' ? 'paystack' : 'cod',
      };

      const orderResponse = await api.post('/ecommerce/orders', orderData);
      const order = orderResponse.data;

      if (paymentMethod === 'paystack') {
        // Initialize Paystack payment
        const paymentResponse = await api.post(`/payments/paystack/initialize`, null, {
          params: { order_id: order.id },
        });

        const { authorization_url } = paymentResponse.data;
        
        // Redirect to Paystack
        window.location.href = authorization_url;
      } else {
        // Cash on delivery or other methods
        setOrderNumber(order.order_number);
        setActiveStep(2);
        clearCart();
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(formatApiErrorDetail(err) || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    hapticTap();
    setActiveStep(activeStep - 1);
    setError(null);
  };

  const subtotalAfterDiscount = Math.max(0, cartTotal - appliedDiscount);
  const total = subtotalAfterDiscount + shippingCost;

  const primaryActionLabel =
    loading ? 'Processing...' : activeStep === 1 ? 'Complete order' : 'Continue to payment';

  const renderCouponField = () => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        Coupon code
      </Typography>
      <Box display="flex" gap={1} alignItems="flex-start">
        <TextField
          size="small"
          fullWidth
          placeholder="Enter code"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          disabled={!!appliedCouponCode || couponApplying}
          sx={{ '& input': { textTransform: 'uppercase' } }}
        />
        {appliedCouponCode ? (
          <Button
            variant="outlined"
            size="small"
            onClick={clearCoupon}
            sx={{ textTransform: 'none', flexShrink: 0, minHeight: 44 }}
          >
            Remove
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="small"
            onClick={handleApplyCoupon}
            disabled={couponApplying || !couponInput.trim()}
            sx={{ textTransform: 'none', flexShrink: 0, minHeight: 44 }}
          >
            {couponApplying ? '…' : 'Apply'}
          </Button>
        )}
      </Box>
      {couponError && (
        <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
          {couponError}
        </Typography>
      )}
      {appliedCouponCode && !couponError && (
        <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
          Applied: {appliedCouponCode}
        </Typography>
      )}
    </Box>
  );

  const renderTotals = () => (
    <>
      <Box display="flex" justifyContent="space-between" mb={0.75}>
        <Typography variant="body2">Subtotal</Typography>
        <Typography variant="body2">GHS {cartTotal.toLocaleString()}</Typography>
      </Box>
      {appliedDiscount > 0 && (
        <Box display="flex" justifyContent="space-between" mb={0.75}>
          <Typography variant="body2" color="secondary.main">
            Discount
          </Typography>
          <Typography variant="body2" color="secondary.main">
            −GHS {appliedDiscount.toLocaleString()}
          </Typography>
        </Box>
      )}
      <Box display="flex" justifyContent="space-between" mb={0.75} alignItems="flex-start">
        <Typography variant="body2">Shipping</Typography>
        <Box textAlign="right">
          <Typography variant="body2">
            {shippingCost === 0 ? 'Free' : `GHS ${shippingCost.toLocaleString()}`}
          </Typography>
          {shippingNote && (
            <Typography variant="caption" display="block" sx={{ color: colors.gray600, mt: 0.5 }}>
              {shippingNote}
            </Typography>
          )}
        </Box>
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Box display="flex" justifyContent="space-between" mb={isMobile ? 0 : 2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Total
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.greenDark }}>
          GHS {total.toLocaleString()}
        </Typography>
      </Box>
    </>
  );

  const renderOrderSummaryBody = () => (
    <>
      {cartItems.map((item) => (
        <Box key={item.id} sx={{ mb: 1.5 }}>
          <Box display="flex" justifyContent="space-between" gap={1}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.product?.name || 'Product'} × {item.quantity}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
              GHS {(catalogLineUnitPrice(item.product) * item.quantity).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      ))}
      <Divider sx={{ my: 1.5 }} />
      {renderCouponField()}
      {renderTotals()}
    </>
  );

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/checkout" noIndex />
      <PublicPageShell
        badge={hero.badge}
        headline={hero.headline}
        description={hero.description}
        contentPy={{ xs: 3, md: 5 }}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 3, display: { xs: 'none', md: 'flex' } }}>
          {stepLabelsDesktop.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{
                bgcolor: 'transparent',
                px: 0,
                '& .MuiMobileStepper-dot': { mx: 0.4 },
              }}
              nextButton={<span />}
              backButton={<span />}
            />
            <Typography sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', mt: 0.5 }}>
              Step {activeStep + 1} of {steps.length} — {steps[activeStep]}
            </Typography>
          </Box>
        )}

        {isMobile && activeStep < 2 && (
          <Accordion
            defaultExpanded={activeStep === 0}
            disableGutters
            elevation={0}
            sx={{
              ...publicUi.card,
              mb: 2,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ minHeight: 48, px: 2, '& .MuiAccordionSummary-content': { my: 1 } }}
            >
              <Box display="flex" justifyContent="space-between" width="100%" pr={1}>
                <Typography sx={{ fontWeight: 700 }}>Order summary</Typography>
                <Typography sx={{ fontWeight: 700, color: colors.greenDark }}>
                  GHS {total.toLocaleString()}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              {renderOrderSummaryBody()}
            </AccordionDetails>
          </Accordion>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Card sx={publicUi.card}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                    Shipping Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name *"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleShippingChange('firstName', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name *"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleShippingChange('lastName', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email *"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingChange('email', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone *"
                        value={shippingInfo.phone}
                        onChange={(e) => handleShippingChange('phone', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address *"
                        value={shippingInfo.address}
                        onChange={(e) => handleShippingChange('address', e.target.value)}
                        required
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City *"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Region"
                        value={shippingInfo.region}
                        onChange={(e) => handleShippingChange('region', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={billingSame}
                            onChange={(e) => {
                              setBillingSame(e.target.checked);
                              if (e.target.checked) {
                                setBillingInfo({
                                  ...shippingInfo,
                                  email: shippingInfo.email,
                                });
                              }
                            }}
                          />
                        }
                        label="Billing address same as shipping address"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {activeStep === 1 && (
              <Card sx={publicUi.card}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                    Payment Method
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <FormControlLabel
                        value="paystack"
                        control={<Radio />}
                        sx={paymentOptionSx}
                        label={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Paystack (Card, Mobile Money, Bank Transfer)
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.gray600 }}>
                              Secure payment via Paystack
                            </Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="cod"
                        control={<Radio />}
                        sx={paymentOptionSx}
                        label={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Cash on Delivery
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.gray600 }}>
                              Pay when you receive your order
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ mt: 2.5, p: 2, borderRadius: homeUi.innerRadius, bgcolor: colors.offWhite, border: homeUi.cardBorder }}
                  >
                    {[
                      { icon: <LockIcon fontSize="small" />, text: 'Secure Paystack checkout' },
                      { icon: <VerifiedIcon fontSize="small" />, text: 'Manufacturer warranty on equipment' },
                      { icon: <ShippingIcon fontSize="small" />, text: 'Delivery across Ghana' },
                    ].map((item) => (
                      <Stack key={item.text} direction="row" spacing={1} alignItems="center" sx={{ color: colors.gray600, fontSize: '0.8125rem' }}>
                        <Box sx={{ color: colors.green, display: 'flex' }}>{item.icon}</Box>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>{item.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Box sx={{ mt: 2.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the{' '}
                          <Link component={RouterLink} to="/terms" sx={publicUi.inlineLink}>
                            Terms of use
                          </Link>{' '}
                          and{' '}
                          <Link component={RouterLink} to="/privacy" sx={publicUi.inlineLink}>
                            Privacy policy
                          </Link>
                        </Typography>
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {activeStep === 2 && (
              <Card sx={publicUi.card}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
                  <Typography sx={{ mb: 1.5, color: colors.greenDark, fontWeight: 800, fontSize: '1.25rem' }}>
                    Order confirmed!
                  </Typography>
                  <Typography sx={{ mb: 2, ...publicUi.mutedText }}>
                    Order number: {orderNumber}
                  </Typography>
                  <Typography sx={{ mb: 3, ...publicUi.mutedText }}>
                    Thank you for your order. A confirmation email is on its way.
                  </Typography>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/shop"
                    sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
                  >
                    Continue shopping
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Order Summary — desktop sidebar */}
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Card
              sx={{
                ...publicUi.card,
                position: 'sticky',
                top: 88,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                  Order Summary
                </Typography>
                {renderOrderSummaryBody()}

                {activeStep < 2 && (
                  <Box>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading || (activeStep === 1 && !termsAccepted)}
                      sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, mb: 1 }}
                    >
                      {primaryActionLabel}
                    </Button>
                    {activeStep > 0 && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleBack}
                        disabled={loading}
                        sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget }}
                      >
                        Back
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {isMobile && activeStep < 2 && (
          <Box
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: mobileCheckoutBarBottom(),
              zIndex: theme.zIndex.appBar - 1,
              px: 2,
              py: 1.25,
              bgcolor: 'rgba(251, 251, 253, 0.94)',
              backdropFilter: 'saturate(180%) blur(16px)',
              WebkitBackdropFilter: 'saturate(180%) blur(16px)',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={1}>
              <Typography sx={{ fontSize: '0.8125rem', color: colors.gray600 }}>Total</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: colors.greenDark }}>
                GHS {total.toLocaleString()}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget, flex: '0 0 auto', px: 2.5 }}
                >
                  Back
                </Button>
              )}
              <Button
                fullWidth
                variant="contained"
                onClick={handleNext}
                disabled={loading || (activeStep === 1 && !termsAccepted)}
                sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, flex: 1 }}
              >
                {primaryActionLabel}
              </Button>
            </Stack>
          </Box>
        )}
      </PublicPageShell>
    </>
  );
};

export default Checkout;

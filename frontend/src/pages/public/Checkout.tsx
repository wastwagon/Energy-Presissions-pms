import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { catalogLineUnitPrice } from '../../utils/catalogPrice';
import { Seo } from '../../components/Seo';
import { trackBeginCheckout } from '../../utils/analytics';

const steps = ['Shipping Information', 'Payment', 'Confirmation'];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
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
      <Box sx={{ py: { xs: 5, md: 6 }, textAlign: 'center' }}>
        <Seo
          title="Checkout"
          description="Complete your Energy Precisions order."
          path="/checkout"
          noIndex
        />
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your cart is empty
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/shop')}
            sx={{
              bgcolor: '#00E676',
              '&:hover': { bgcolor: '#00C85F' },
              textTransform: 'none',
            }}
          >
            Continue Shopping
          </Button>
        </Container>
      </Box>
    );
  }

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo({ ...shippingInfo, [field]: value });
    if (billingSame && field !== 'email') {
      setBillingInfo({ ...billingInfo, [field]: value });
    }
  };

  const handleNext = async () => {
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
      setError(err.response?.data?.detail || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError(null);
  };

  const subtotalAfterDiscount = Math.max(0, cartTotal - appliedDiscount);
  const total = subtotalAfterDiscount + shippingCost;

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Seo
        title="Checkout"
        description="Shipping, payment and order confirmation for Energy Precisions."
        path="/checkout"
        noIndex
      />
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ mb: 3, fontWeight: 800, color: '#1a4d7a', fontSize: { xs: '1.5rem', md: '1.85rem' } }}>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Card>
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
              <Card>
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
                        label={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Paystack (Card, Mobile Money, Bank Transfer)
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Secure payment via Paystack
                            </Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="cod"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Cash on Delivery
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Pay when you receive your order
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>

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
                          I agree to the Terms & Conditions and Payment Terms
                        </Typography>
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {activeStep === 2 && (
              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ mb: 1.5, color: '#00E676', fontWeight: 800 }}>
                    Order Confirmed!
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#666' }}>
                    Order Number: {orderNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: '#666', lineHeight: 1.65 }}>
                    Thank you for your order! We've sent a confirmation email to your inbox.
                    You will receive updates about your order status.
                  </Typography>
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => navigate('/shop')}
                    sx={{
                      bgcolor: '#00E676',
                      '&:hover': { bgcolor: '#00C85F' },
                      textTransform: 'none',
                    }}
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                  Order Summary
                </Typography>

                {cartItems.map((item) => (
                  <Box key={item.id} sx={{ mb: 1.5 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">
                        {item.product?.name || 'Product'} × {item.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        GHS {(catalogLineUnitPrice(item.product) * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ my: 1.5 }} />

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
                      <Button variant="outlined" size="small" onClick={clearCoupon} sx={{ textTransform: 'none', flexShrink: 0 }}>
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleApplyCoupon}
                        disabled={couponApplying || !couponInput.trim()}
                        sx={{ textTransform: 'none', flexShrink: 0 }}
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
                      <Typography variant="caption" display="block" sx={{ color: '#666', mt: 0.5 }}>
                        {shippingNote}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00E676' }}>
                    GHS {total.toLocaleString()}
                  </Typography>
                </Box>

                {activeStep < 2 && (
                  <Box>
                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      onClick={handleNext}
                      disabled={loading || (activeStep === 1 && !termsAccepted)}
                      sx={{
                        bgcolor: '#00E676',
                        '&:hover': { bgcolor: '#00C85F' },
                        textTransform: 'none',
                        mb: 1,
                      }}
                    >
                      {loading
                        ? 'Processing...'
                        : activeStep === 1
                        ? 'Complete Order'
                        : 'Continue to Payment'}
                    </Button>
                    {activeStep > 0 && (
                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        onClick={handleBack}
                        disabled={loading}
                        sx={{
                          borderColor: '#1a4d7a',
                          color: '#1a4d7a',
                          '&:hover': { borderColor: '#1a4d7a', bgcolor: 'rgba(26, 77, 122, 0.04)' },
                          textTransform: 'none',
                        }}
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
      </Container>
    </Box>
  );
};

export default Checkout;

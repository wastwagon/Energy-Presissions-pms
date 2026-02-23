import React, { useState } from 'react';
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

const steps = ['Shipping Information', 'Payment', 'Confirmation'];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

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

  if (cartItems.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
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
          unit_price: item.product?.base_price || 0,
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
        shipping_cost: 0, // Calculate based on shipping method
        discount_amount: 0,
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

  const shippingCost: number = 0; // TODO: Calculate based on shipping method
  const total = cartTotal + shippingCost;

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#1a4d7a' }}>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Shipping Information
                  </Typography>
                  <Grid container spacing={3}>
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
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
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

                  <Box sx={{ mt: 4 }}>
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
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 2, color: '#00E676', fontWeight: 'bold' }}>
                    Order Confirmed!
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, color: '#666' }}>
                    Order Number: {orderNumber}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
                    Thank you for your order! We've sent a confirmation email to your inbox.
                    You will receive updates about your order status.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/shop')}
                    sx={{
                      bgcolor: '#00E676',
                      '&:hover': { bgcolor: '#00C85F' },
                      textTransform: 'none',
                      px: 4,
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
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Order Summary
                </Typography>

                {cartItems.map((item) => (
                  <Box key={item.id} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">
                        {item.product?.name || 'Product'} × {item.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        GHS {((item.product?.base_price || 0) * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Subtotal</Typography>
                  <Typography variant="body1">GHS {cartTotal.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Shipping</Typography>
                  <Typography variant="body1">
                    {shippingCost === 0 ? 'Free' : `GHS ${shippingCost.toLocaleString()}`}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00E676' }}>
                    GHS {total.toLocaleString()}
                  </Typography>
                </Box>

                {activeStep < 2 && (
                  <Box>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading || (activeStep === 1 && !termsAccepted)}
                      sx={{
                        bgcolor: '#00E676',
                        '&:hover': { bgcolor: '#00C85F' },
                        textTransform: 'none',
                        py: 1.5,
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { Seo } from '../../components/Seo';
import { trackPurchase } from '../../utils/analytics';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
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
    // Clear cart on successful payment
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
      <Box sx={{ py: { xs: 5, md: 6 }, textAlign: 'center' }}>
        <Seo
          title="Order confirmation"
          description="Verifying your payment."
          path="/checkout/success"
          noIndex
        />
        <Container maxWidth="md">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 1.5 }}>
            Verifying your payment...
          </Typography>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: { xs: 5, md: 6 } }}>
        <Seo
          title="Order verification"
          description="Payment verification issue."
          path="/checkout/success"
          noIndex
        />
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            size="medium"
            onClick={() => navigate('/contact')}
            sx={{
              bgcolor: '#00E676',
              '&:hover': { bgcolor: '#00C85F' },
              textTransform: 'none',
            }}
          >
            Contact Support
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Seo
        title="Thank you for your order"
        description="Your Energy Precisions order confirmation."
        path="/checkout/success"
        noIndex
      />
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#00E676', mb: 1.5 }} />
            <Typography variant="h2" sx={{ mb: 1.5, fontWeight: 800, color: '#1a4d7a', fontSize: { xs: '1.5rem', md: '1.85rem' } }}>
              Payment Successful!
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#00E676', fontWeight: 700 }}>
              Order Number: {order?.order_number}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666', lineHeight: 1.65 }}>
              Thank you for your order! We've sent a confirmation email to your inbox.
              <br />
              Your order is being processed and you will receive updates about your order status.
            </Typography>

            {order && (
              <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2, mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                  Order Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Total Amount:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    GHS {order.total_amount?.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Payment Status:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#00E676' }}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box display="flex" gap={1.5} justifyContent="center" flexWrap="wrap">
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
              <Button
                variant="outlined"
                size="medium"
                onClick={() => navigate('/contact')}
                sx={{
                  borderColor: '#1a4d7a',
                  color: '#1a4d7a',
                  '&:hover': { borderColor: '#1a4d7a', bgcolor: 'rgba(26, 77, 122, 0.04)' },
                  textTransform: 'none',
                }}
              >
                Contact Us
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CheckoutSuccess;




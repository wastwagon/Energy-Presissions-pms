import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      verifyOrder();
    } else {
      setError('No order number provided');
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    // Clear cart on successful payment
    if (order && order.payment_status === 'paid') {
      clearCart();
    }
  }, [order, clearCart]);

  const verifyOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payments/paystack/verify/${orderNumber}`);
      
      if (response.data.verified) {
        const orderResponse = await api.get(`/ecommerce/orders/${orderNumber}`);
        setOrder(orderResponse.data);
      } else {
        setError('Payment verification failed. Please contact support if payment was deducted.');
      }
    } catch (err: any) {
      console.error('Error verifying order:', err);
      setError('Unable to verify order. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Verifying your payment...
          </Typography>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
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
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#00E676', mb: 2 }} />
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#1a4d7a' }}>
              Payment Successful!
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: '#00E676' }}>
              Order Number: {order?.order_number}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#666', lineHeight: 1.8 }}>
              Thank you for your order! We've sent a confirmation email to your inbox.
              <br />
              Your order is being processed and you will receive updates about your order status.
            </Typography>

            {order && (
              <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderRadius: 2, mb: 4, textAlign: 'left' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
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

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
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
              <Button
                variant="outlined"
                onClick={() => navigate('/contact')}
                sx={{
                  borderColor: '#1a4d7a',
                  color: '#1a4d7a',
                  '&:hover': { borderColor: '#1a4d7a', bgcolor: 'rgba(26, 77, 122, 0.04)' },
                  textTransform: 'none',
                  px: 4,
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




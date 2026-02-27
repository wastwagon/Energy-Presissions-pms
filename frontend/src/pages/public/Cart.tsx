import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const API_URL = (window as any).REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL.replace(/\/$/, '')}${url}`;
  return url;
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeFromCart, updateCartItem, loading } = useCart();

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Box sx={{ py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#1a4d7a' }}>
            Shopping Cart
          </Typography>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <ShoppingCartIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                Your cart is empty
              </Typography>
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
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#1a4d7a' }}>
          Shopping Cart
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => {
                    const price = item.product?.base_price || 0;
                    const total = price * item.quantity;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {getImageUrl(item.product?.image_url) ? (
                                <img
                                  src={getImageUrl(item.product?.image_url)}
                                  alt={item.product?.name || 'Product'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <ShoppingCartIcon sx={{ color: '#ccc' }} />
                              )}
                            </Box>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {item.product?.name || 'Product'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                GHS {price.toLocaleString()} each
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={loading}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={loading}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1">GHS {price.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            GHS {total.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            onClick={() => removeFromCart(item.id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Order Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body1">Subtotal</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    GHS {cartTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body1">Shipping</Typography>
                  <Typography variant="body1">Calculated at checkout</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00E676' }}>
                    GHS {cartTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/checkout')}
                  sx={{
                    bgcolor: '#00E676',
                    '&:hover': { bgcolor: '#00C85F' },
                    textTransform: 'none',
                    py: 1.5,
                  }}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/shop')}
                  sx={{
                    mt: 2,
                    borderColor: '#1a4d7a',
                    color: '#1a4d7a',
                    '&:hover': { borderColor: '#1a4d7a', bgcolor: 'rgba(26, 77, 122, 0.04)' },
                    textTransform: 'none',
                  }}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;



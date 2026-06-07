import React from 'react';
import {
  Box,
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
  Link,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { catalogLineUnitPrice } from '../../utils/catalogPrice';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';

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
      <>
        <Seo
          title="Shopping Cart"
          description="Your Energy Precisions cart — solar equipment checkout."
          path="/cart"
          noIndex
        />
        <PublicPageShell badge="Shop" headline="Shopping cart" description="Review equipment before checkout.">
          <Card sx={publicUi.card}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 5, md: 6 } }}>
              <ShoppingCartIcon sx={{ fontSize: 64, color: colors.gray400, mb: 1.5 }} />
              <Typography sx={{ ...publicUi.mutedText, mb: 2 }}>Your cart is empty</Typography>
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
        </PublicPageShell>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Shopping Cart"
        description="Review your solar equipment order before checkout."
        path="/cart"
        noIndex
      />
      <PublicPageShell badge="Shop" headline="Shopping cart" description="Review items and proceed to secure checkout.">
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Card} sx={publicUi.card}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => {
                    const price = catalogLineUnitPrice(item.product);
                    const total = price * item.quantity;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                bgcolor: colors.offWhite,
                                borderRadius: homeUi.innerRadius,
                                overflow: 'hidden',
                                flexShrink: 0,
                              }}
                            >
                              {resolveMediaUrl(item.product?.image_url) ? (
                                <img
                                  src={resolveMediaUrl(item.product?.image_url)}
                                  alt={item.product?.name || 'Product'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                  <ShoppingCartIcon sx={{ color: colors.gray400 }} />
                                </Box>
                              )}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                                {item.product?.name || 'Product'}
                              </Typography>
                              <Typography sx={{ ...publicUi.mutedText, fontSize: '0.8125rem' }}>
                                GHS {price.toLocaleString()} each
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={loading}
                              sx={{ minWidth: 44, minHeight: 44 }}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ minWidth: 32, textAlign: 'center' }}>{item.quantity}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={loading}
                              sx={{ minWidth: 44, minHeight: 44 }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">GHS {price.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 700 }}>GHS {total.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton color="error" onClick={() => removeFromCart(item.id)} disabled={loading}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography sx={{ ...publicUi.mutedText, fontSize: '0.8125rem', mt: 2 }}>
              Need installation?{' '}
              <Link component={RouterLink} to="/contact?action=quote&topic=shop" sx={publicUi.inlineLink}>
                Request a site survey
              </Link>{' '}
              after checkout.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ ...publicUi.card, position: { md: 'sticky' }, top: { md: 88 } }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography sx={{ mb: 2, fontWeight: 700 }}>Order summary</Typography>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    GHS {cartTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">At checkout</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, color: colors.greenDark }}>
                    GHS {cartTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/checkout')}
                  sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, mb: 1.5 }}
                >
                  Proceed to checkout
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  component={RouterLink}
                  to="/shop"
                  sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget }}
                >
                  Continue shopping
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </PublicPageShell>
    </>
  );
};

export default Cart;

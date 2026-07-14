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
  Stack,
  useTheme,
  useMediaQuery,
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
import ProductImage from '../../components/public/ProductImage';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';
import type { CartItem } from '../../contexts/CartContext';

type CartLineProps = {
  item: CartItem;
  loading: boolean;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
};

const CartLineMobile: React.FC<CartLineProps> = ({ item, loading, onQuantityChange, onRemove }) => {
  const price = catalogLineUnitPrice(item.product);
  const total = price * item.quantity;

  return (
    <Card sx={publicUi.card}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" gap={2}>
          <Box
            sx={{
              width: 72,
              height: 72,
              bgcolor: colors.offWhite,
              borderRadius: homeUi.innerRadius,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {item.product ? (
              <ProductImage
                product={item.product}
                alt={item.product.name || 'Product'}
                sx={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <ShoppingCartIcon sx={{ color: colors.gray400 }} />
              </Box>
            )}
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography sx={{ ...homeUi.body, fontWeight: 700, lineHeight: 1.3 }}>
              {item.product?.name || 'Product'}
            </Typography>
            <Typography sx={{ ...homeUi.caption, ...publicUi.mutedText, mt: 0.25 }}>
              GHS {price.toLocaleString()} each
            </Typography>
            <Typography sx={{ ...homeUi.body, fontWeight: 700, mt: 1, color: colors.greenDark }}>
              GHS {total.toLocaleString()}
            </Typography>
          </Box>
          <IconButton
            color="error"
            aria-label="Remove item"
            onClick={() => onRemove(item.id)}
            disabled={loading}
            sx={{ minWidth: 44, minHeight: 44, alignSelf: 'flex-start' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Typography sx={{ ...homeUi.caption, fontWeight: 600, color: colors.gray600 }}>
            Quantity
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton
              aria-label="Decrease quantity"
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={loading}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <RemoveIcon />
            </IconButton>
            <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>
              {item.quantity}
            </Typography>
            <IconButton
              aria-label="Increase quantity"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={loading}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Cart: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeFromCart, updateCartItem, loading } = useCart();
  const { sections } = useCmsPage('cart');
  const seo = resolveCmsSeo(sections, {
    title: 'Shopping Cart | Energy Precisions',
    description: 'Review your solar equipment order before checkout.',
  });
  const { hero, empty_state: emptyState, footer_note: footerNote } = sections;

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const orderSummary = (
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
  );

  if (cartItems.length === 0) {
    return (
      <>
        <Seo title={seo.title} description={seo.description} path="/cart" noIndex />
        <PublicPageShell badge={hero.badge} headline={hero.headline} description={hero.description}>
          <Card sx={publicUi.card}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 5, md: 6 } }}>
              <ShoppingCartIcon sx={{ fontSize: 64, color: colors.gray400, mb: 1.5 }} />
              <Typography sx={{ ...publicUi.mutedText, mb: 2 }}>
                {emptyState?.title || 'Your cart is empty'}
              </Typography>
              <Button
                variant="contained"
                component={RouterLink}
                to="/shop"
                sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
              >
                {emptyState?.cta_text || 'Continue shopping'}
              </Button>
            </CardContent>
          </Card>
        </PublicPageShell>
      </>
    );
  }

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/cart" noIndex />
      <PublicPageShell badge={hero.badge} headline={hero.headline} description={hero.description}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={8}>
            {isMobile ? (
              <Stack spacing={1.5}>
                {cartItems.map((item) => (
                  <CartLineMobile
                    key={item.id}
                    item={item}
                    loading={loading}
                    onQuantityChange={handleQuantityChange}
                    onRemove={removeFromCart}
                  />
                ))}
              </Stack>
            ) : (
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
                                {item.product ? (
                                  <ProductImage
                                    product={item.product}
                                    alt={item.product.name || 'Product'}
                                    sx={{ width: '100%', height: '100%' }}
                                  />
                                ) : (
                                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                    <ShoppingCartIcon sx={{ color: colors.gray400 }} />
                                  </Box>
                                )}
                              </Box>
                              <Box>
                                <Typography sx={{ ...homeUi.body, fontWeight: 700 }}>
                                  {item.product?.name || 'Product'}
                                </Typography>
                                <Typography sx={{ ...homeUi.caption, ...publicUi.mutedText }}>
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
                            <IconButton
                              color="error"
                              aria-label="Remove item"
                              onClick={() => removeFromCart(item.id)}
                              disabled={loading}
                              sx={{ minWidth: 44, minHeight: 44 }}
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
            )}
            <Typography sx={{ ...homeUi.caption, ...publicUi.mutedText, mt: 2 }}>
              {footerNote || 'Need installation?'}{' '}
              <Link component={RouterLink} to="/contact?action=quote&topic=shop" sx={publicUi.inlineLink}>
                Request a site survey
              </Link>{' '}
              after checkout.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            {orderSummary}
          </Grid>
        </Grid>
      </PublicPageShell>
    </>
  );
};

export default Cart;

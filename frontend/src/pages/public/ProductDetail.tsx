import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CircularProgress,
  Chip,
  Stack,
  Table,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { catalogLineUnitPrice } from '../../utils/catalogPrice';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import ProductImage from '../../components/public/ProductImage';
import { trackViewItem, trackAddToCart } from '../../utils/analytics';
import { resolveCatalogImageUrl } from '../../utils/catalogImage';
import { formatApiErrorDetail } from '../../utils/apiErrorMessage';
import { productJsonLd } from '../../utils/jsonLd';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { mobileFixedAboveTabBar } from '../../utils/mobileChrome';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Invalid product');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/ecommerce/products/${id}`);
        setProduct(res.data);
        setError(null);
        if (res.data?.product_type) {
          api
            .get('/ecommerce/products', { params: { product_type: res.data.product_type } })
            .then((r) => {
              const list = (r.data || []).filter((p: any) => String(p.id) !== String(id)).slice(0, 3);
              setRelated(list);
            })
            .catch(() => {});
        }
      } catch {
        setProduct(null);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (loading || error || !product) return;
    const name = product.name || `${product.brand || ''} ${product.model || ''}`.trim() || 'Product';
    const unitPrice = catalogLineUnitPrice(product);
    trackViewItem({ item_id: String(product.id), item_name: name, price: unitPrice, quantity: 1 });
  }, [loading, error, product]);

  const productPath = id ? `/products/${id}` : '/shop';

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', bgcolor: homeUi.pageBg }}>
        <Seo title="Product" description="Solar equipment." path={productPath} noIndex />
        <CircularProgress sx={{ color: colors.green }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <>
        <Seo title="Product not found" description="Not available." path={productPath} noIndex />
        <PublicPageShell
          badge="Shop"
          headline="Product not found"
          description="This item may have been removed or the link is outdated. Browse our solar equipment catalog."
          heroAlign="center"
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              component={RouterLink}
              to="/shop"
              variant="contained"
              sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
            >
              Browse shop
            </Button>
            <Button
              component={RouterLink}
              to="/contact?action=quote&topic=shop"
              variant="outlined"
              sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget }}
            >
              Request a quote
            </Button>
          </Stack>
        </PublicPageShell>
      </>
    );
  }

  const title = product.name || `${product.brand || ''} ${product.model || ''}`.trim() || 'Product';
  const unit = catalogLineUnitPrice(product);
  const img = resolveCatalogImageUrl(product);
  const desc = product.description || product.short_description || 'Premium solar equipment from Energy Precisions catalog.';
  const ogImage = /^https?:\/\//i.test(img) ? img : undefined;
  const inStock = product.in_stock !== false;
  const typeLabel = product.product_type
    ? String(product.product_type).charAt(0).toUpperCase() + String(product.product_type).slice(1)
    : 'Shop';

  const specs: { label: string; value: string }[] = [];
  if (product.sku) specs.push({ label: 'SKU', value: product.sku });
  if (product.product_type) specs.push({ label: 'Type', value: String(product.product_type) });
  if (product.brand) specs.push({ label: 'Brand', value: product.brand });
  if (product.model) specs.push({ label: 'Model', value: product.model });
  if (product.wattage) specs.push({ label: 'Wattage', value: `${product.wattage} W` });
  if (product.capacity_kw) specs.push({ label: 'Capacity', value: `${product.capacity_kw} kW` });
  if (product.capacity_kwh) specs.push({ label: 'Storage', value: `${product.capacity_kwh} kWh` });
  if (product.category) specs.push({ label: 'Category', value: product.category });

  const handleAdd = async () => {
    try {
      await addToCart(product.id, 1);
      trackAddToCart([{ item_id: String(product.id), item_name: title, price: unit, quantity: 1 }]);
      navigate('/cart');
    } catch (e: any) {
      alert(formatApiErrorDetail(e) || 'Failed to add product');
    }
  };

  return (
    <>
      <Seo
        title={title}
        description={desc.slice(0, 160)}
        path={productPath}
        ogImage={ogImage}
        jsonLd={productJsonLd({
          id: product.id,
          name: title,
          description: desc,
          image: img,
          price: unit,
          inStock,
          brand: product.brand,
        })}
      />
      <PublicPageShell badge={typeLabel} headline={title} description={product.short_description || desc.slice(0, 120)}>
        <Button
          startIcon={<ArrowBackIcon />}
          size="small"
          onClick={() => navigate('/shop')}
          sx={{ mb: 2, textTransform: 'none', color: colors.blueNavy }}
        >
          Back to shop
        </Button>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ ...publicUi.card, overflow: 'hidden' }}>
              <Box
                sx={{
                  minHeight: { xs: 280, md: 360 },
                  bgcolor: colors.offWhite,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <ProductImage
                  product={product}
                  alt={title}
                  objectFit="contain"
                  sx={{ maxWidth: '100%', maxHeight: 340 }}
                />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              {product.product_type && (
                <Chip label={String(product.product_type)} size="small" sx={{ bgcolor: colors.blueBlack, color: '#fff' }} />
              )}
              <Chip
                label={inStock ? 'In stock · Accra warehouse' : 'Out of stock'}
                size="small"
                sx={inStock ? { bgcolor: colors.green, color: colors.blueBlack } : undefined}
                color={inStock ? undefined : 'error'}
              />
            </Stack>

            <Typography sx={{ ...homeUi.title, fontSize: { xs: '1.5rem', md: '1.75rem' }, color: colors.blueBlack, mb: 1 }}>
              GHS {unit.toLocaleString()}
            </Typography>
            {product.price_type && product.price_type !== 'fixed' && (
              <Typography sx={{ ...publicUi.mutedText, fontSize: '0.8125rem', mb: 2 }}>
                Pricing: {product.price_type.replace(/_/g, ' ')}
              </Typography>
            )}

            <Typography sx={{ ...homeUi.body, ...publicUi.mutedText, mb: 3 }}>{desc}</Typography>

            {!isMobile && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAdd}
                  disabled={!inStock}
                  sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 3 }}
                >
                  Add to cart
                </Button>
                <Button
                  component={RouterLink}
                  to="/contact?action=quote&topic=shop"
                  variant="outlined"
                  startIcon={<EngineeringIcon />}
                  sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget, px: 3 }}
                >
                  Add installation quote
                </Button>
              </Stack>
            )}

            {specs.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Specifications</Typography>
                <Card sx={publicUi.card}>
                  <Table size="small">
                    <TableBody>
                      {specs.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell sx={{ fontWeight: 600, width: '38%', borderColor: colors.gray200 }}>{row.label}</TableCell>
                          <TableCell sx={{ ...publicUi.mutedText, borderColor: colors.gray200 }}>{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </Box>
            )}

            <Typography sx={{ ...publicUi.mutedText, fontSize: '0.8125rem', mt: 2 }}>
              <RouterLink to="/warranty" style={{ color: colors.greenDark, fontWeight: 600, textDecoration: 'none' }}>
                Warranty information
              </RouterLink>
            </Typography>
          </Grid>
        </Grid>

        {related.length > 0 && (
          <Box sx={{ mt: { xs: 5, md: 7 } }}>
            <Typography sx={{ ...homeUi.title, fontSize: '1.125rem', mb: 2 }}>Related products</Typography>
            <Grid container spacing={2}>
              {related.map((p) => (
                <Grid item xs={12} sm={4} key={p.id}>
                  <Button
                    component={RouterLink}
                    to={`/products/${p.id}`}
                    fullWidth
                    variant="outlined"
                    sx={{ ...publicUi.secondaryButton, py: 1.5, justifyContent: 'flex-start' }}
                  >
                    {p.name || p.model || 'Product'}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </PublicPageShell>

      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: mobileFixedAboveTabBar(),
            zIndex: theme.zIndex.appBar - 1,
            px: 2,
            py: 1,
            bgcolor: 'rgba(251, 251, 253, 0.94)',
            backdropFilter: 'blur(16px)',
            borderTop: homeUi.cardBorder,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdd}
              disabled={!inStock}
              sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}
            >
              Add to cart · GHS {unit.toLocaleString()}
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default ProductDetail;

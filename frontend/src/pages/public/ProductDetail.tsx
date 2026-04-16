import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import { ShoppingCart as ShoppingCartIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { catalogLineUnitPrice } from '../../utils/catalogPrice';
import { Seo } from '../../components/Seo';
import { trackViewItem, trackAddToCart } from '../../utils/analytics';
import { resolveApiUrl } from '../../utils/apiUrl';

const API_URL = resolveApiUrl();

const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  const clean = url.trim().replace(/^['"]|['"]$/g, '');
  if (!clean) return '';
  const base = API_URL.replace(/\/$/, '');
  if (/^https?:\/\//i.test(clean)) {
    const isLegacyLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(clean);
    if (isLegacyLocal && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const path = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
      return `${base}${path.startsWith('/') ? path : `/${path}`}`;
    }
    return clean;
  }
  if (clean.startsWith('/')) return `${base}${clean}`;
  if (clean.startsWith('static/')) return `${base}/${clean}`;
  return `${base}/${clean}`;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any | null>(null);
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
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <Seo
          title="Product"
          description="Solar equipment from Energy Precisions — panels, inverters, batteries and more."
          path={productPath}
          noIndex
        />
        <CircularProgress sx={{ color: '#00E676' }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <Seo
          title="Product not found"
          description="This product is not available in our catalog."
          path={productPath}
          noIndex
        />
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {error || 'Product not found'}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/shop')} sx={{ textTransform: 'none' }}>
          Back to shop
        </Button>
      </Box>
    );
  }

  const title = product.name || `${product.brand || ''} ${product.model || ''}`.trim() || 'Product';
  const unit = catalogLineUnitPrice(product);
  const img = getImageUrl(product.image_url);
  const desc =
    (product.description || product.short_description || 'Premium solar equipment from Energy Precisions catalog.').slice(0, 300);
  const ogImage = /^https?:\/\//i.test(img) ? img : undefined;

  const handleAdd = async () => {
    try {
      await addToCart(product.id, 1);
      trackAddToCart([{ item_id: String(product.id), item_name: title, price: unit, quantity: 1 }]);
      navigate('/cart');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to add product');
    }
  };

  return (
    <Box sx={{ py: { xs: 3, md: 5 } }}>
      <Seo title={title} description={desc} path={productPath} ogImage={ogImage} />
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          size="small"
          onClick={() => navigate('/shop')}
          sx={{ mb: 2, textTransform: 'none', color: '#1a4d7a' }}
        >
          Back to shop
        </Button>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ overflow: 'hidden' }}>
              <Box
                sx={{
                  minHeight: { xs: 280, md: 320 },
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                }}
              >
                {img ? (
                  <Box
                    component="img"
                    src={img}
                    alt={title}
                    sx={{ maxWidth: '100%', maxHeight: { xs: 260, md: 300 }, objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="h6" sx={{ color: '#999' }}>
                    {title}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
              {product.product_type && (
                <Chip label={String(product.product_type)} size="small" sx={{ bgcolor: '#1a4d7a', color: '#fff' }} />
              )}
              {product.in_stock === false ? (
                <Chip label="Out of stock" size="small" color="error" />
              ) : (
                <Chip label="In stock" size="small" sx={{ bgcolor: '#00E676', color: '#fff' }} />
              )}
            </Stack>
            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 800, color: '#1a4d7a', fontSize: { xs: '1.25rem', md: '1.4rem' } }}>
              {title}
            </Typography>
            {product.brand && (
              <Typography variant="body2" sx={{ color: '#666', mb: 1.5 }}>
                {product.brand}
                {product.model ? ` · ${product.model}` : ''}
              </Typography>
            )}
            <Typography variant="h6" sx={{ mb: 2, color: '#00E676', fontWeight: 700 }}>
              GHS {unit.toLocaleString()}
              {product.price_type && product.price_type !== 'fixed' && (
                <Typography component="span" variant="caption" sx={{ color: '#666', ml: 1, fontWeight: 400 }}>
                  ({product.price_type.replace(/_/g, ' ')})
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666', lineHeight: 1.65 }}>
              {product.description || product.short_description || 'Premium solar equipment from our catalog.'}
            </Typography>
            <Button
              variant="contained"
              size="medium"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAdd}
              disabled={product.in_stock === false}
              sx={{
                bgcolor: '#00E676',
                '&:hover': { bgcolor: '#00C85F' },
                textTransform: 'none',
              }}
            >
              Add to Cart
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductDetail;

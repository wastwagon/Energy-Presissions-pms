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

const API_URL = (window as any).REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL.replace(/\/$/, '')}${url}`;
  return url;
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

  const productPath = id ? `/products/${id}` : '/shop';

  if (loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
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
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Seo
          title="Product not found"
          description="This product is not available in our catalog."
          path={productPath}
          noIndex
        />
        <Typography variant="h5" sx={{ mb: 2 }}>
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
      navigate('/cart');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to add product');
    }
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Seo title={title} description={desc} path={productPath} ogImage={ogImage} />
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/shop')}
          sx={{ mb: 3, textTransform: 'none', color: '#1a4d7a' }}
        >
          Back to shop
        </Button>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ overflow: 'hidden' }}>
              <Box
                sx={{
                  minHeight: 400,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                {img ? (
                  <Box
                    component="img"
                    src={img}
                    alt={title}
                    sx={{ maxWidth: '100%', maxHeight: 380, objectFit: 'contain' }}
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
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              {product.product_type && (
                <Chip label={String(product.product_type)} size="small" sx={{ bgcolor: '#1a4d7a', color: '#fff' }} />
              )}
              {product.in_stock === false ? (
                <Chip label="Out of stock" size="small" color="error" />
              ) : (
                <Chip label="In stock" size="small" sx={{ bgcolor: '#00E676', color: '#fff' }} />
              )}
            </Stack>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#1a4d7a' }}>
              {title}
            </Typography>
            {product.brand && (
              <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                {product.brand}
                {product.model ? ` · ${product.model}` : ''}
              </Typography>
            )}
            <Typography variant="h5" sx={{ mb: 3, color: '#00E676', fontWeight: 'bold' }}>
              GHS {unit.toLocaleString()}
              {product.price_type && product.price_type !== 'fixed' && (
                <Typography component="span" variant="body2" sx={{ color: '#666', ml: 1, fontWeight: 400 }}>
                  ({product.price_type.replace(/_/g, ' ')})
                </Typography>
              )}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#666', lineHeight: 1.8 }}>
              {product.description || product.short_description || 'Premium solar equipment from our catalog.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAdd}
              disabled={product.in_stock === false}
              sx={{
                bgcolor: '#00E676',
                '&:hover': { bgcolor: '#00C85F' },
                textTransform: 'none',
                px: 4,
                py: 1.5,
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

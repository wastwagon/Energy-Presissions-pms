import React from 'react';
import { Box, Container, Typography, Grid, Button, Card, CardContent } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// This will be replaced with API call later
const getProduct = (id: string) => {
  const products = [
    {
      id: 1,
      name: 'JA Solar 570W Solar Panel',
      price: 1400,
      category: 'Solar Panels',
      description: 'High-efficiency monocrystalline solar panel with 570W output. Perfect for residential and commercial installations.',
      fullDescription: 'The JA Solar 570W panel features advanced PERC technology for maximum efficiency. With a 25-year warranty and excellent performance in various weather conditions.',
      inStock: true,
    },
  ];
  return products.find((p) => p.id === parseInt(id));
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? getProduct(id) : null;

  if (!product) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Product not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <Box
                sx={{
                  height: 400,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" sx={{ color: '#999' }}>
                  {product.name}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#1a4d7a' }}>
              {product.name}
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, color: '#00E676', fontWeight: 'bold' }}>
              GHS {product.price.toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#666', lineHeight: 1.8 }}>
              {product.fullDescription || product.description}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/cart')}
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




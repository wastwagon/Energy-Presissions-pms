import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const API_URL = (window as any).REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL.replace(/\/$/, '')}${url}`;
  return url;
};

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (categoryFilter !== 'all') params.category = categoryFilter;
        if (searchTerm) params.search = searchTerm;
        
        const response = await api.get('/ecommerce/products', { params });
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchTerm]);

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'panel', label: 'Solar Panels' },
    { value: 'inverter', label: 'Inverters' },
    { value: 'battery', label: 'Batteries' },
    { value: 'Accessories', label: 'Accessories' },
  ];

  const filteredProducts = products.filter((product: any) => {
    if (searchTerm) {
      const matchesSearch = (product.name || product.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }
    if (categoryFilter !== 'all') {
      return product.product_type === categoryFilter || product.category === categoryFilter;
    }
    return true;
  });

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      navigate('/cart');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to add product to cart');
    }
  };

  const getProductTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      panel: 'Solar Panel',
      inverter: 'Inverter',
      battery: 'Battery',
    };
    return labels[type] || type;
  };

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, minHeight: '80vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Header */}
      <Box
        sx={{
          bgcolor: '#1a4d7a',
          color: 'white',
          py: { xs: 6, md: 8 },
          mb: 6,
        }}
      >
      <Container maxWidth="xl">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              mb: 2,
            }}
          >
            Premium Solar Equipment
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '700px',
              fontWeight: 400,
            }}
          >
            Shop Ghana's finest selection of solar panels, inverters, batteries, and accessories. 
            All products come with warranty and expert installation support.
          </Typography>
        </Container>
        </Box>

      <Container maxWidth="xl">
        {/* Filters and Search Bar */}
        <Box
          sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            mb: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
          <TextField
                fullWidth
                placeholder="Search products by name, brand, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
          />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
            >
              {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <IconButton
                  onClick={() => setViewMode('grid')}
                  sx={{
                    color: viewMode === 'grid' ? '#00E676' : '#999',
                    border: viewMode === 'grid' ? '2px solid #00E676' : '2px solid #e0e0e0',
                  }}
                >
                  <GridViewIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  sx={{
                    color: viewMode === 'list' ? '#00E676' : '#999',
                    border: viewMode === 'list' ? '2px solid #00E676' : '2px solid #e0e0e0',
                  }}
                >
                  <ViewListIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>

          {/* Results Count */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </Typography>
            {filteredProducts.length > 0 && (
              <Chip
                label={`${filteredProducts.length} Products Found`}
                size="small"
                sx={{ bgcolor: '#00E676', color: 'white', fontWeight: 'bold' }}
              />
            )}
          </Box>
        </Box>

        {/* Products Grid */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              Loading products...
            </Typography>
          </Box>
        ) : paginatedProducts.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {paginatedProducts.map((product: any) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        transform: 'translateY(-8px)',
                        borderColor: '#00E676',
                      },
                    }}
                  >
                    {/* Product Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        bgcolor: '#f8f9fa',
                        height: 250,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                      }}
                    >
                      <Box
                      component="img"
                        src={getImageUrl(product.image_url) || 'https://placehold.co/300x300/e8e8e8/999?text=No+Image'}
                      alt={product.name || `${product.brand} ${product.model}`}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Badge */}
                      {product.in_stock !== false && (
                        <Chip
                          label="In Stock"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: '#00E676',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Category */}
                      <Chip
                        label={getProductTypeLabel(product.product_type || product.category || 'Product')}
                        size="small"
                        sx={{
                          bgcolor: '#1a4d7a',
                          color: 'white',
                          mb: 1.5,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      />

                      {/* Product Name */}
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          fontWeight: 700,
                          color: '#1a4d7a',
                          minHeight: '3rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.name || `${product.brand} ${product.model}`}
                      </Typography>

                      {/* Brand */}
                      {product.brand && (
                        <Typography variant="body2" sx={{ color: '#999', mb: 1.5 }}>
                          {product.brand}
                        </Typography>
                      )}

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          color: '#666',
                          minHeight: '3rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.short_description || product.description || 'Premium quality solar equipment'}
                      </Typography>

                      {/* Features */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          icon={<SecurityIcon sx={{ fontSize: '1rem' }} />}
                          label="Warranty"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <Chip
                          icon={<ShippingIcon sx={{ fontSize: '1rem' }} />}
                          label="Free Delivery"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Price */}
                      <Box sx={{ mb: 2 }}>
                      <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#1a4d7a',
                            mb: 0.5,
                          }}
                      >
                        GHS {((product.base_price || product.price || 0)).toLocaleString()}
                      </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Including VAT
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.in_stock === false}
                        sx={{
                          bgcolor: '#00E676',
                          color: 'white',
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: '#00C85F',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0, 230, 118, 0.3)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {product.in_stock !== false ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
              <Box display="flex" justifyContent="center" mt={6}>
                <Pagination
                  count={Math.ceil(filteredProducts.length / itemsPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root.Mui-selected': {
                      bgcolor: '#00E676',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#00C85F',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box
            textAlign="center"
            py={10}
            sx={{
              bgcolor: 'white',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h5" sx={{ color: '#1a4d7a', mb: 2, fontWeight: 700 }}>
              No products found
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
              Try adjusting your search or filter criteria
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
              sx={{
                bgcolor: '#00E676',
                '&:hover': { bgcolor: '#00C85F' },
                textTransform: 'none',
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}

        {/* Trust Section */}
        <Box
          sx={{
            mt: 8,
            bgcolor: 'white',
            p: 4,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            {[
              { icon: <SecurityIcon />, title: 'Warranty Guaranteed', desc: 'All products come with manufacturer warranty' },
              { icon: <ShippingIcon />, title: 'Free Delivery', desc: 'Free delivery across Ghana for orders over GHS 5,000' },
              { icon: <CheckCircleIcon />, title: 'Quality Assured', desc: 'Only premium, certified equipment' },
              { icon: <TrendingUpIcon />, title: 'Expert Support', desc: 'Free consultation and installation support' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ color: '#00E676', fontSize: '2.5rem' }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a4d7a', mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Shop;

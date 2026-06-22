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
  Pagination,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Seo } from '../../components/Seo';
import { useCart } from '../../contexts/CartContext';
import { catalogLineUnitPrice } from '../../utils/catalogPrice';
import { trackAddToCart } from '../../utils/analytics';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import PublicPageShell from '../../components/public/PublicPageShell';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import FilterChip from '../../components/public/FilterChip';
import ProductImage from '../../components/public/ProductImage';
import { formatApiErrorDetail } from '../../utils/apiErrorMessage';
import { hapticTap } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

const Shop: React.FC = () => {
  const { sections } = useCmsPage('shop');
  const seo = resolveCmsSeo(sections, {
    title: 'Shop Solar Equipment Ghana | Panels, Inverters & Batteries',
    description:
      'Browse solar panels, inverters, batteries and accessories from Energy Precisions. Website pricing in GHS with delivery and support across Ghana.',
  });
  const shopHero = sections.hero;
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
        const params: Record<string, string> = {};
        if (categoryFilter !== 'all') {
          if (['panel', 'inverter', 'battery'].includes(categoryFilter)) {
            params.product_type = categoryFilter;
          } else {
            params.category = categoryFilter;
          }
        }
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

  useEffect(() => {
    setPage(1);
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

  const handleAddToCart = async (product: any) => {
    hapticTap();
    try {
      await addToCart(product.id, 1);
      const unit = catalogLineUnitPrice(product);
      const name = product.name || `${product.brand || ''} ${product.model || ''}`.trim() || 'Product';
      trackAddToCart([{ item_id: String(product.id), item_name: name, price: unit, quantity: 1 }]);
      navigate('/cart');
    } catch (error: any) {
      alert(formatApiErrorDetail(error) || 'Failed to add product to cart');
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
    <>
      <Seo title={seo.title} description={seo.description} path={pathname} />
      <PublicPageShell
        badge={shopHero.badge}
        headline={shopHero.headline}
        description={shopHero.description}
        wrapContent={false}
      >
      <Container maxWidth="xl" sx={{ px: publicUi.containerPx, py: { xs: 4, md: 6 } }}>
        {/* Filters and Search Bar */}
        <Box sx={{ ...publicUi.card, p: 3, mb: 4 }}>
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
                      <SearchIcon sx={{ color: colors.gray600 }} />
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
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="Grid view"
                  sx={{
                    width: 44,
                    height: 44,
                    color: viewMode === 'grid' ? colors.green : '#999',
                    border: viewMode === 'grid' ? `2px solid ${colors.green}` : `2px solid ${colors.gray200}`,
                  }}
                >
                  <GridViewIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label="List view"
                  sx={{
                    width: 44,
                    height: 44,
                    color: viewMode === 'list' ? colors.green : '#999',
                    border: viewMode === 'list' ? `2px solid ${colors.green}` : `2px solid ${colors.gray200}`,
                  }}
                >
                  <ViewListIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 2,
              mx: { xs: -1, sm: 0 },
              px: { xs: 1, sm: 0 },
              overflowX: { xs: 'auto', sm: 'visible' },
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              flexWrap={{ xs: 'nowrap', sm: 'wrap' }}
              useFlexGap
              role="group"
              aria-label="Filter by category"
              sx={{ pb: { xs: 0.5, sm: 0 }, minWidth: { xs: 'min-content', sm: 'auto' } }}
            >
            {categories.map((cat) => (
              <FilterChip
                key={cat.value}
                label={cat.label}
                selected={categoryFilter === cat.value}
                onSelect={() => setCategoryFilter(cat.value)}
              />
            ))}
            </Stack>
          </Box>

          {/* Results Count */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: colors.gray600 }}>
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </Typography>
            {filteredProducts.length > 0 && (
              <Chip
                label={`${filteredProducts.length} Products Found`}
                size="small"
                sx={{ bgcolor: colors.green, color: 'white', fontWeight: 'bold' }}
              />
            )}
          </Box>
        </Box>

        {/* Products Grid */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" sx={{ color: colors.gray600 }}>
              Loading products...
            </Typography>
          </Box>
        ) : paginatedProducts.length > 0 ? (
          <>
            <Grid container spacing={viewMode === 'list' ? 2 : 3}>
              {paginatedProducts.map((product: any) => (
                <Grid
                  item
                  xs={12}
                  sm={viewMode === 'list' ? 12 : 6}
                  md={viewMode === 'list' ? 12 : 4}
                  lg={viewMode === 'list' ? 12 : 3}
                  key={product.id}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: viewMode === 'list' ? 'row' : 'column',
                      borderRadius: 3,
                      border: `1px solid ${colors.gray200}`,
                      overflow: 'hidden',
                      transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
                      '&:active': { transform: 'scale(0.98)' },
                      '@media (hover: hover)': {
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                          transform: viewMode === 'list' ? 'translateX(4px)' : 'translateY(-8px)',
                          borderColor: colors.green,
                        },
                      },
                    }}
                  >
                    {/* Product Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        bgcolor: colors.offWhite,
                        flexShrink: 0,
                        width: viewMode === 'list' ? { xs: 112, sm: 200, md: 220 } : '100%',
                        height: viewMode === 'list' ? { xs: 'auto', sm: 'auto' } : 250,
                        alignSelf: viewMode === 'list' ? 'stretch' : undefined,
                        minHeight: viewMode === 'list' ? { xs: 112, sm: 180 } : undefined,
                        overflow: 'hidden',
                      }}
                    >
                      <ProductImage
                        product={product}
                        alt={product.name || `${product.brand} ${product.model}`}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          transform: 'scale(1.08)',
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
                            bgcolor: colors.green,
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: viewMode === 'list' ? 'flex' : 'contents',
                        flex: viewMode === 'list' ? 1 : undefined,
                        flexDirection: 'column',
                        minWidth: 0,
                      }}
                    >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: viewMode === 'list' ? { xs: 1.5, sm: 2 } : 2,
                        display: viewMode === 'list' ? 'flex' : 'block',
                        flexDirection: viewMode === 'list' ? 'column' : undefined,
                        minWidth: 0,
                      }}
                    >
                      {/* Category */}
                      <Chip
                        label={getProductTypeLabel(product.product_type || product.category || 'Product')}
                        size="small"
                        sx={{
                          bgcolor: colors.blueNavy,
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
                          color: colors.blueNavy,
                          minHeight: viewMode === 'list' ? 'auto' : '2.6rem',
                          display: '-webkit-box',
                          WebkitLineClamp: viewMode === 'list' ? 2 : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: viewMode === 'list' ? { xs: '0.9375rem', sm: '1.125rem' } : undefined,
                        }}
                      >
                        {product.name || `${product.brand} ${product.model}`}
                      </Typography>

                      {/* Brand */}
                      {product.brand && (
                        <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                          {product.brand}
                        </Typography>
                      )}

                      {/* Description */}
                      {viewMode !== 'list' && (
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1.25,
                          color: colors.gray600,
                          minHeight: '2.4rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.short_description || product.description || 'Premium quality solar equipment'}
                      </Typography>
                      )}

                      {/* Features */}
                      {viewMode !== 'list' && (
                      <Stack direction="row" spacing={1} sx={{ mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
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
                      )}

                      <Divider sx={{ my: viewMode === 'list' ? 1 : 1.25 }} />

                      {/* Price */}
                      <Box sx={{ mb: 1.25 }}>
                      <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: colors.blueNavy,
                            mb: 0.5,
                            fontSize: viewMode === 'list' ? { xs: '1.25rem', sm: '1.5rem' } : undefined,
                          }}
                      >
                        GHS {catalogLineUnitPrice(product).toLocaleString()}
                      </Typography>
                        <Typography variant="body2" sx={{ color: '#999', display: viewMode === 'list' ? { xs: 'none', sm: 'block' } : 'block' }}>
                          Including VAT
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions
                      sx={{
                        p: viewMode === 'list' ? { xs: 1.5, sm: 2 } : 3,
                        pt: 0,
                        mt: viewMode === 'list' ? 'auto' : undefined,
                        flexDirection: viewMode === 'list' ? { xs: 'row', sm: 'column' } : 'column',
                        gap: 1,
                        alignItems: 'stretch',
                        flexShrink: 0,
                      }}
                    >
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/products/${product.id}`)}
                        sx={{
                          borderColor: colors.blueNavy,
                          color: colors.blueNavy,
                          ...homeUi.touchTarget,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                        }}
                      >
                        View details
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.in_stock === false}
                        sx={{
                          bgcolor: colors.green,
                          color: 'white',
                          ...homeUi.touchTarget,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          '@media (hover: hover)': {
                            '&:hover': {
                              bgcolor: colors.greenDark,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(0, 230, 118, 0.3)',
                            },
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {product.in_stock !== false ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </CardActions>
                    </Box>
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
                      bgcolor: colors.green,
                      color: 'white',
                      '&:hover': {
                        bgcolor: colors.greenDark,
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
            <Typography variant="h5" sx={{ color: colors.blueNavy, mb: 2, fontWeight: 700 }}>
              No products found
            </Typography>
            <Typography variant="body1" sx={{ color: colors.gray600, mb: 4 }}>
              Try adjusting your search or filter criteria
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
              sx={{
                bgcolor: colors.green,
                '&:hover': { bgcolor: colors.greenDark },
                textTransform: 'none',
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}

        {/* Trust Section */}
        <Box sx={{ ...publicUi.card, mt: 8, p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            {[
              { icon: <SecurityIcon />, title: 'Warranty Guaranteed', desc: 'All products come with manufacturer warranty' },
              { icon: <ShippingIcon />, title: 'Free Delivery', desc: 'Free delivery across Ghana for orders over GHS 5,000' },
              { icon: <CheckCircleIcon />, title: 'Quality Assured', desc: 'Only premium, certified equipment' },
              { icon: <TrendingUpIcon />, title: 'Expert Support', desc: 'Free consultation and installation support' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ color: colors.green, fontSize: '2.5rem' }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.blueNavy, mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.gray600 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      </PublicPageShell>
      <PublicStickyMobileCta
        label="Need installation help?"
        to="/contact?action=quote&topic=shop"
      />
    </>
  );
};

export default Shop;

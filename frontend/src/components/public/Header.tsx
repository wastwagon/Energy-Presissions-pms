import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Our Company', path: '/about' },
    {
      label: 'Services',
      path: '/services',
      submenu: [
        { label: 'Residential Solar', path: '/services/residential' },
        { label: 'Commercial Solar', path: '/services/commercial' },
        { label: 'Battery Storage', path: '/services/battery' },
        { label: 'FAQs', path: '/faqs' },
      ],
    },
    { label: 'Shop', path: '/shop' },
    { label: 'Our Products', path: '/products' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAdminLogin = () => {
    navigate('/pms/admin');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 'bold' }}>
        ENERGY PRECISIONS
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} to={item.path} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={handleAdminLogin} sx={{ textAlign: 'center' }}>
            <ListItemText primary="Admin Login" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Top Bar */}
      <Box
        sx={{
          bgcolor: '#1a4d7a',
          color: 'white',
          py: 1,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">+233 533 611 611</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">info@energyprecisions.com</Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#00E676',
                color: 'white',
                '&:hover': { bgcolor: '#00C85F' },
                textTransform: 'none',
                px: 3,
              }}
              component={Link}
              to="/contact?action=quote"
            >
              REQUEST A QUOTE
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Navigation */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'white', 
          color: '#333',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 },
                mr: { md: 4 },
              }}
            >
              <img
                src="/website_images/Logo1-1-scaled-e1752479241874.png"
                alt="Energy Precisions"
                style={{
                  height: '50px',
                  maxWidth: '200px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span style="font-weight: bold; color: #1a4d7a;">ENERGY PRECISIONS</span>';
                  }
                }}
              />
            </Box>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, ml: 4 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: '#1a4d7a',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': { 
                        color: '#00E676',
                        bgcolor: 'rgba(0, 230, 118, 0.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1}>
              <IconButton component={Link} to="/cart" color="inherit" sx={{ position: 'relative' }}>
                <ShoppingCartIcon />
                {cartCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: '#00E676',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </Box>
                )}
              </IconButton>
              {isAuthenticated ? (
                <>
                  <IconButton onClick={handleMenuClick} color="inherit">
                    <AccountCircleIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => { navigate('/account'); handleMenuClose(); }}>
                      My Account
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/pms/dashboard'); handleMenuClose(); }}>
                      Admin Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => { logout(); handleMenuClose(); }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
              <Button
                variant="outlined"
                onClick={handleAdminLogin}
                sx={{
                  textTransform: 'none',
                  borderColor: '#1a4d7a',
                  borderWidth: 2,
                  color: '#1a4d7a',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    borderColor: '#1a4d7a',
                    borderWidth: 2,
                    bgcolor: 'rgba(26, 77, 122, 0.08)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Admin Login
              </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;


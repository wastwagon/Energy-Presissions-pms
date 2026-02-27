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
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [servicesMenuEl, setServicesMenuEl] = useState<null | HTMLElement>(null);
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
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Shop', path: '/shop' },
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

  const handleServicesOpen = (e: React.MouseEvent<HTMLElement>) => {
    setServicesMenuEl(e.currentTarget);
  };
  const handleServicesClose = () => {
    setServicesMenuEl(null);
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
            {item.submenu ? (
              <>
                <ListItemButton component={Link} to={item.path} sx={{ textAlign: 'center' }}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
                {item.submenu.map((sub) => (
                  <ListItem key={sub.label} disablePadding sx={{ pl: 2 }}>
                    <ListItemButton component={Link} to={sub.path} sx={{ textAlign: 'center' }}>
                      <ListItemText primary={sub.label} secondary="" />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            ) : (
              <ListItemButton component={Link} to={item.path} sx={{ textAlign: 'center' }}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )}
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
      {/* Top Bar - visible on all screens for mobile-first CTA */}
      <Box
        sx={{
          bgcolor: colors.blueBlack,
          color: 'white',
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', md: 'center' }}
            gap={{ xs: 1, md: 0 }}
          >
            <Box display="flex" flexWrap="wrap" gap={{ xs: 1.5, md: 3 }} justifyContent="center">
              <Box component="a" href="tel:+233533611611" display="flex" alignItems="center" gap={1} sx={{ color: 'inherit', textDecoration: 'none' }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">+233 533 611 611</Typography>
              </Box>
              <Box component="a" href="mailto:info@energyprecisions.com" display="flex" alignItems="center" gap={1} sx={{ color: 'inherit', textDecoration: 'none' }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>info@energyprecisions.com</Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                '&:hover': { bgcolor: colors.greenDark },
                textTransform: 'none',
                px: 3,
                fontWeight: 600,
              }}
              component={Link}
              to="/contact?action=quote"
            >
              Request a Quote
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
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, ml: 4, alignItems: 'center' }}>
                {menuItems.map((item) =>
                  item.submenu ? (
                    <Box key={item.label}>
                      <Button
                        onClick={handleServicesOpen}
                        endIcon={<ArrowDownIcon />}
                        sx={{
                          color: colors.blueBlack,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          '&:hover': {
                            color: colors.green,
                            bgcolor: 'rgba(0, 230, 118, 0.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {item.label}
                      </Button>
                      <Menu
                        anchorEl={servicesMenuEl}
                        open={Boolean(servicesMenuEl)}
                        onClose={handleServicesClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        sx={{ mt: 1.5 }}
                      >
                        <MenuItem component={Link} to={item.path} onClick={handleServicesClose}>
                          All Services
                        </MenuItem>
                        {item.submenu.map((sub) => (
                          <MenuItem
                            key={sub.label}
                            component={Link}
                            to={sub.path}
                            onClick={handleServicesClose}
                          >
                            {sub.label}
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  ) : (
                    <Button
                      key={item.label}
                      component={Link}
                      to={item.path}
                      sx={{
                        color: colors.blueBlack,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          color: colors.green,
                          bgcolor: 'rgba(0, 230, 118, 0.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                )}
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
                      bgcolor: colors.green,
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
                    <MenuItem onClick={() => { navigate('/pms/dashboard'); handleMenuClose(); }}>
                      Dashboard
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
                borderColor: colors.blueBlack,
                borderWidth: 2,
                color: colors.blueBlack,
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    borderColor: colors.blueBlack,
                    borderWidth: 2,
                    bgcolor: 'rgba(10, 14, 23, 0.08)',
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


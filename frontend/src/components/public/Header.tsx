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
  Paper,
  ButtonBase,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Home as HomeIcon,
  Storefront as StorefrontIcon,
  SolarPower as SolarPowerIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { SOCIAL_LINKS } from '../../data/socialLinks';
import { UserRole } from '../../types';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
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
    { label: 'Financing', path: '/financing' },
    { label: 'Resources', path: '/blog' },
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

  const socialIconSx = {
    color: 'rgba(255,255,255,0.85)',
    '&:hover': { color: colors.green, bgcolor: 'rgba(255,255,255,0.06)' },
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 1.5 }}>
      <Typography variant="subtitle1" sx={{ mb: 1.5, color: theme.palette.primary.main, fontWeight: 700 }}>
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
      </List>
    </Box>
  );

  const navButtonSx = {
    color: colors.blueBlack,
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '0.8125rem',
    px: 1.35,
    py: 0.65,
    borderRadius: 2,
    minHeight: 36,
    letterSpacing: '0.01em',
    '&:hover': {
      color: colors.green,
      bgcolor: 'rgba(0, 230, 118, 0.08)',
    },
    transition: 'color 0.2s ease, background-color 0.2s ease',
  };

  const isPathActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const mobileBottomActive = (key: 'home' | 'shop' | 'services' | 'cart' | 'more') => {
    const p = location.pathname;
    switch (key) {
      case 'home':
        return p === '/';
      case 'shop':
        return p.startsWith('/shop') || p.startsWith('/products');
      case 'services':
        return p.startsWith('/services');
      case 'cart':
        return p === '/cart';
      default:
        return false;
    }
  };

  const bottomNavItem = (
    key: 'home' | 'shop' | 'services' | 'cart' | 'more',
    icon: React.ReactNode,
    label: string,
    to?: string,
    onPress?: () => void
  ) => {
    const active = key === 'more' ? mobileOpen : mobileBottomActive(key);
    const content = (
      <>
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {icon}
          {key === 'cart' && cartCount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -6,
                right: -10,
                bgcolor: colors.green,
                color: 'white',
                borderRadius: '10px',
                minWidth: 18,
                height: 18,
                px: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </Box>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            mt: 0.35,
            fontSize: '0.65rem',
            fontWeight: active ? 700 : 500,
            color: active ? colors.green : 'text.secondary',
            letterSpacing: 0.2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </>
    );

    if (to) {
      return (
        <ButtonBase
          key={key}
          component={Link}
          to={to}
          sx={{
            flex: 1,
            flexDirection: 'column',
            py: 0.5,
            px: 0.25,
            borderRadius: 2,
            color: active ? colors.green : 'text.secondary',
            '&:active': { transform: 'scale(0.97)' },
            transition: 'transform 0.12s ease, color 0.2s ease',
          }}
        >
          {content}
        </ButtonBase>
      );
    }

    return (
      <ButtonBase
        key={key}
        onClick={onPress}
        sx={{
          flex: 1,
          flexDirection: 'column',
          py: 0.5,
          px: 0.25,
          borderRadius: 2,
          color: active ? colors.green : 'text.secondary',
          '&:active': { transform: 'scale(0.97)' },
          transition: 'transform 0.12s ease, color 0.2s ease',
        }}
      >
        {content}
      </ButtonBase>
    );
  };

  return (
    <>
      {/* Top Bar */}
      <Box
        sx={{
          bgcolor: colors.blueBlack,
          color: 'white',
          py: 0.75,
        }}
      >
        <Container maxWidth="xl">
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            gap={{ xs: 1.25, sm: 1 }}
          >
            <Box
              display="flex"
              flexWrap="wrap"
              gap={{ xs: 1, sm: 2, md: 3 }}
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              alignItems="center"
            >
              <Box
                component="a"
                href="tel:+233533611611"
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                <PhoneIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  +233 533 611 611
                </Typography>
              </Box>
              <Box
                component="a"
                href="mailto:info@energyprecisions.com"
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                <EmailIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.875rem' }}>
                  info@energyprecisions.com
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.25} sx={{ ml: { sm: 0.5 } }}>
                <IconButton
                  component="a"
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label="Facebook"
                  sx={socialIconSx}
                >
                  <FacebookIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton
                  component="a"
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label="X (Twitter)"
                  sx={socialIconSx}
                >
                  <TwitterIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton
                  component="a"
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label="LinkedIn"
                  sx={socialIconSx}
                >
                  <LinkedInIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton
                  component="a"
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label="Instagram"
                  sx={socialIconSx}
                >
                  <InstagramIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: colors.green,
                color: 'white',
                '&:hover': { bgcolor: colors.greenDark },
                textTransform: 'none',
                px: 2.25,
                py: 0.65,
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0, 230, 118, 0.35)',
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
          borderBottom: '1px solid #e8eaed',
          boxShadow: '0 2px 12px rgba(10, 14, 23, 0.06)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              py: { xs: 0.75, md: 1 },
              minHeight: { xs: 52, md: 64 },
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr auto 1fr'
                : 'minmax(140px, auto) 1fr minmax(120px, auto)',
              alignItems: 'center',
              columnGap: 2,
            }}
          >
            {/* Mobile: spacer */}
            {isMobile && <Box />}
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                justifySelf: isMobile ? 'center' : 'start',
                gridColumn: isMobile ? 2 : 'auto',
              }}
            >
              <img
                src="/website_images/Logo1-1-scaled-e1752479241874.png"
                alt="Energy Precisions"
                style={{
                  height: isMobile ? '38px' : '44px',
                  maxWidth: '200px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML =
                      '<span style="font-weight: bold; color: #1a4d7a;">ENERGY PRECISIONS</span>';
                  }
                }}
              />
            </Box>

            {/* Desktop: centered nav */}
            {!isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 0.15,
                  py: 0.25,
                }}
              >
                {menuItems.map((item) =>
                  item.submenu ? (
                    <Box key={item.label}>
                      <Button
                        onClick={handleServicesOpen}
                        endIcon={<ArrowDownIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          ...navButtonSx,
                          ...(isPathActive('/services') || location.pathname.startsWith('/faqs')
                            ? { color: colors.green, bgcolor: 'rgba(0, 230, 118, 0.06)' }
                            : {}),
                        }}
                      >
                        {item.label}
                      </Button>
                      <Menu
                        anchorEl={servicesMenuEl}
                        open={Boolean(servicesMenuEl)}
                        onClose={handleServicesClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                        slotProps={{
                          paper: {
                            sx: {
                              mt: 1,
                              borderRadius: 2,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                              minWidth: 200,
                            },
                          },
                        }}
                      >
                        <MenuItem component={Link} to={item.path} onClick={handleServicesClose}>
                          All Services
                        </MenuItem>
                        {item.submenu.map((sub) => (
                          <MenuItem key={sub.label} component={Link} to={sub.path} onClick={handleServicesClose}>
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
                        ...navButtonSx,
                        ...(isPathActive(item.path) ? { color: colors.green, bgcolor: 'rgba(0, 230, 118, 0.06)' } : {}),
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                )}
              </Box>
            )}

            {/* Right: desktop cart + account; mobile account only */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                justifyContent: 'flex-end',
                justifySelf: 'end',
                gridColumn: isMobile ? 3 : 'auto',
              }}
            >
              {!isMobile && (
                <IconButton component={Link} to="/cart" color="inherit" sx={{ position: 'relative', color: colors.blueBlack }}>
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
              )}
              {isAuthenticated ? (
                <>
                  <IconButton onClick={handleMenuClick} color="inherit" aria-label="Account menu" sx={{ color: colors.blueBlack }}>
                    <AccountCircleIcon />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem
                      onClick={() => {
                        const dest =
                          user?.role === UserRole.WEBSITE_ADMIN ? '/web/app' : '/pms/dashboard';
                        navigate(dest);
                        handleMenuClose();
                      }}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        logout();
                        handleMenuClose();
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300, borderTopRightRadius: 16, borderBottomRightRadius: 16 },
        }}
      >
        {drawer}
      </Drawer>

      {/* App-style bottom navigation (mobile / tablet) */}
      {isMobile && (
        <Paper
          component="nav"
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.drawer + 2,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            px: 0.5,
            pt: 0.5,
            pb: 'max(10px, env(safe-area-inset-bottom))',
            borderTop: `1px solid rgba(10, 14, 23, 0.08)`,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8faf9 100%)',
            boxShadow: '0 -6px 28px rgba(10, 14, 23, 0.12)',
          }}
          aria-label="Primary mobile navigation"
        >
          <Box display="flex" alignItems="stretch" justifyContent="space-around">
            {bottomNavItem(
              'home',
              <HomeIcon sx={{ fontSize: 26 }} />,
              'Home',
              '/'
            )}
            {bottomNavItem(
              'shop',
              <StorefrontIcon sx={{ fontSize: 26 }} />,
              'Shop',
              '/shop'
            )}
            {bottomNavItem(
              'services',
              <SolarPowerIcon sx={{ fontSize: 26 }} />,
              'Services',
              '/services'
            )}
            {bottomNavItem(
              'cart',
              <ShoppingCartIcon sx={{ fontSize: 26 }} />,
              'Cart',
              '/cart'
            )}
            {bottomNavItem(
              'more',
              <MenuIcon sx={{ fontSize: 26 }} />,
              'More',
              undefined,
              () => setMobileOpen(true)
            )}
          </Box>
        </Paper>
      )}
    </>
  );
};

export default Header;

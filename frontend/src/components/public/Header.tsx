import React, { useState, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
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
  Close as CloseIcon,
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
  Bolt as BoltIcon,
  ContactMail as ContactIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { UserRole } from '../../types';
import { useCmsPage } from '../../hooks/useCmsPage';
import { getCmsDefaults } from '../../data/cmsDefaults';
import type { CmsHeaderNavItem } from '../../types/cms';
import { hapticTap } from '../../utils/haptics';

const sheetHandleSx = {
  width: 36,
  height: 4,
  borderRadius: 999,
  bgcolor: 'rgba(0, 0, 0, 0.18)',
};

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoverNav, setHoverNav] = useState<string | null>(null);
  const hoverNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { contact, social, cta } = useGlobalSiteConfig();
  const { sections: globalSections } = useCmsPage('global');
  const defaultHeader = getCmsDefaults('global').header;
  const menuItems: CmsHeaderNavItem[] =
    globalSections.header?.menu_items?.length > 0
      ? globalSections.header.menu_items
      : defaultHeader.menu_items;

  const handleNavEnter = (key: string) => {
    if (hoverNavTimer.current) clearTimeout(hoverNavTimer.current);
    setHoverNav(key);
  };

  const handleNavLeave = () => {
    hoverNavTimer.current = setTimeout(() => setHoverNav(null), 160);
  };

  const isPathActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleDrawerToggle = () => {
    setMobileOpen((open) => {
      if (!open) hapticTap();
      return !open;
    });
  };

  const closeDrawer = () => setMobileOpen(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const isSubmenuParentActive = (item: CmsHeaderNavItem) => {
    if (!item.submenu?.length) return false;
    const pathOnly = (p: string) => p.split('?')[0];
    return (
      isPathActive(item.path) ||
      item.submenu.some((sub) => {
        const subPath = pathOnly(sub.path);
        return (
          location.pathname === subPath ||
          location.pathname.startsWith(`${subPath}/`) ||
          (subPath !== '/' && location.pathname.startsWith(subPath))
        );
      })
    );
  };

  const socialIconSx = {
    color: publicUi.topBar.text,
    '&:hover': { color: colors.green, bgcolor: 'rgba(255,255,255,0.08)' },
  };

  const quoteButtonSx = {
    ...publicUi.topBarQuoteButton,
    ...homeUi.nav,
    px: 2.5,
    py: 0.55,
    minHeight: 36,
  };

  const topBarLinkSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    color: publicUi.topBar.text,
    textDecoration: 'none',
    ...homeUi.navLink,
    transition: 'color 0.2s ease',
    '&:hover': { color: colors.green },
  };

  const mobileMenuSheet = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'min(85dvh, 640px)',
        bgcolor: homeUi.pageBg,
      }}
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === 'Escape') closeDrawer();
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 1.25,
          pb: 0.75,
          flexShrink: 0,
        }}
      >
        <Box sx={sheetHandleSx} aria-hidden />
      </Box>
      <Box
        sx={{
          px: 2,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography sx={{ ...homeUi.prose, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Menu
          </Typography>
          <Typography sx={{ ...homeUi.caption, color: colors.gray600, mt: 0.25 }}>
            Energy Precisions
          </Typography>
        </Box>
        <IconButton
          onClick={closeDrawer}
          aria-label="Close menu"
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            border: homeUi.cardBorder,
            color: colors.blueBlack,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>
      <Divider />
      <List
        sx={{
          py: 1.5,
          px: 1,
          flex: 1,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {menuItems.map((item) => (
          <React.Fragment key={item.label}>
            {item.submenu ? (
              <>
                <ListItem disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={closeDrawer}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      px: 1.5,
                      minHeight: 48,
                      textAlign: 'left',
                      '&:hover': { bgcolor: 'rgba(0, 230, 118, 0.08)' },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ color: colors.blueBlack, ...homeUi.drawerItem }}
                    />
                  </ListItemButton>
                </ListItem>
                {item.submenu.map((sub) => (
                  <ListItem key={sub.label} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link}
                      to={sub.path}
                      onClick={closeDrawer}
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        pl: 3,
                        pr: 1.5,
                        minHeight: 48,
                        textAlign: 'left',
                        borderLeft: `3px solid ${colors.green}`,
                        ml: 1.25,
                        '&:hover': { bgcolor: 'rgba(10, 14, 23, 0.04)' },
                      }}
                    >
                      <ListItemText
                        primary={sub.label}
                        primaryTypographyProps={{ color: colors.gray600, ...homeUi.drawerSubItem }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            ) : (
              <ListItem disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={closeDrawer}
                  sx={{
                    borderRadius: 2,
                    py: 1.15,
                    px: 1.5,
                    minHeight: 48,
                    textAlign: 'left',
                    ...(isPathActive(item.path)
                      ? { bgcolor: 'rgba(0, 230, 118, 0.12)', borderLeft: `3px solid ${colors.green}` }
                      : { borderLeft: '3px solid transparent' }),
                    '&:hover': { bgcolor: 'rgba(0, 230, 118, 0.08)' },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ color: colors.blueBlack, ...homeUi.drawerItem, fontWeight: 600 }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const navButtonSx = {
    color: colors.blueBlack,
    textTransform: 'none' as const,
    ...homeUi.nav,
    px: 1.65,
    py: 0.85,
    borderRadius: 2,
    minHeight: 40,
    letterSpacing: '-0.01em',
    transition: 'color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      color: colors.blueBlack,
      bgcolor: 'rgba(0, 230, 118, 0.1)',
    },
  };

  const navActiveSx = {
    color: colors.blueBlack,
    fontWeight: 700,
    bgcolor: 'rgba(0, 230, 118, 0.16)',
    boxShadow: `inset 0 -2px 0 ${colors.green}`,
    '&:hover': {
      bgcolor: 'rgba(0, 230, 118, 0.2)',
    },
  };

  const navItemSx = (active: boolean, open = false) => ({
    ...navButtonSx,
    ...((active || open) ? navActiveSx : {}),
  });

  const dropdownLinkSx = (active: boolean) => ({
    display: 'block',
    px: 1.5,
    py: 1,
    borderRadius: 1.5,
    ...homeUi.navLink,
    fontWeight: active ? 600 : 500,
    color: active ? colors.blueBlack : colors.gray600,
    textDecoration: 'none',
    transition: 'background-color 0.15s ease, color 0.15s ease',
    '&:hover': {
      bgcolor: 'rgba(0, 230, 118, 0.12)',
      color: colors.blueBlack,
    },
    ...(active
      ? {
          bgcolor: 'rgba(0, 230, 118, 0.1)',
          borderLeft: `3px solid ${colors.green}`,
          pl: 1.35,
        }
      : {}),
  });

  type MobileBottomKey = 'home' | 'shop' | 'services' | 'packages' | 'cart' | 'contact';

  const mobileBottomActive = (key: MobileBottomKey) => {
    const p = location.pathname;
    switch (key) {
      case 'home':
        return p === '/';
      case 'shop':
        return p.startsWith('/shop') || p.startsWith('/products');
      case 'services':
        return p.startsWith('/services');
      case 'packages':
        return p.startsWith('/solar-packages');
      case 'cart':
        return p === '/cart';
      case 'contact':
        return p.startsWith('/contact');
      default:
        return false;
    }
  };

  const bottomNavItem = (
    key: MobileBottomKey,
    icon: React.ReactNode,
    label: string,
    to?: string,
    onPress?: () => void
  ) => {
    const active = mobileBottomActive(key);
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
                fontSize: homeUi.chip.fontSize,
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
            ...homeUi.badge,
            textTransform: 'none',
            fontWeight: active ? 600 : 500,
            color: active ? publicUi.bottomNav.active : publicUi.bottomNav.inactive,
            letterSpacing: 0.1,
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
          onClick={() => hapticTap()}
          sx={{
            flex: 1,
            flexDirection: 'column',
            py: 0.75,
            px: 0.25,
            minHeight: 48,
            minWidth: 48,
            borderRadius: 2,
            color: active ? publicUi.bottomNav.active : publicUi.bottomNav.inactive,
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
        onClick={() => {
          hapticTap();
          onPress?.();
        }}
        sx={{
          flex: 1,
          flexDirection: 'column',
          py: 0.75,
          px: 0.25,
          minHeight: 48,
          minWidth: 48,
          borderRadius: 2,
          color: active ? publicUi.bottomNav.active : publicUi.bottomNav.inactive,
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
      {/* Top bar — desktop only */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          background: publicUi.topBar.bgGradient,
          color: publicUi.topBar.text,
          borderBottom: `1px solid ${publicUi.topBar.accentLine}`,
        }}
      >
        <Box sx={{ py: 0.85 }}>
          <Container maxWidth="lg" sx={{ px: publicUi.containerPx }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
              <Box display="flex" flexWrap="wrap" gap={2.5} alignItems="center">
                <Box component="a" href={contact.phoneHref} sx={topBarLinkSx}>
                  <PhoneIcon sx={{ fontSize: 17, color: colors.green }} />
                  {contact.phoneDisplay}
                </Box>
                <Box component="a" href={`mailto:${contact.emailSales}`} sx={topBarLinkSx}>
                  <EmailIcon sx={{ fontSize: 17 }} />
                  {contact.emailSales}
                </Box>
                <Box component="a" href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" sx={topBarLinkSx}>
                  <ChatIcon sx={{ fontSize: 17, color: colors.green }} />
                  {contact.whatsappDisplay}
                </Box>
                <Box display="flex" alignItems="center" gap={0.25}>
                  <IconButton component="a" href={social.facebook} target="_blank" rel="noopener noreferrer" size="small" aria-label="Facebook" sx={socialIconSx}>
                    <FacebookIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton component="a" href={social.twitter} target="_blank" rel="noopener noreferrer" size="small" aria-label="X (Twitter)" sx={socialIconSx}>
                    <TwitterIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton component="a" href={social.linkedin} target="_blank" rel="noopener noreferrer" size="small" aria-label="LinkedIn" sx={socialIconSx}>
                    <LinkedInIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton component="a" href={social.instagram} target="_blank" rel="noopener noreferrer" size="small" aria-label="Instagram" sx={socialIconSx}>
                    <InstagramIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
              <Button size="small" disableElevation sx={quoteButtonSx} component={Link} to={cta.quoteHref}>
                {cta.consultation}
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Main Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          ...publicUi.appBar,
          color: colors.blueBlack,
          pt: { xs: 'env(safe-area-inset-top, 0px)', md: 0 },
        }}
      >
        <Container maxWidth="xl" sx={{ px: publicUi.containerPx }}>
          <Toolbar
            disableGutters
            sx={{
              py: { xs: 0.65, md: 0.85 },
              minHeight: { xs: 48, md: 64 },
              ...(isMobile
                ? {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }
                : {
                    display: 'grid',
                    gridTemplateColumns: 'minmax(160px, auto) 1fr minmax(88px, auto)',
                    alignItems: 'center',
                    columnGap: { md: 2.5, lg: 4 },
                  }),
            }}
          >
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                flexShrink: 0,
                justifySelf: 'start',
              }}
            >
              <img
                src="/website_images/Logo1-1-scaled-e1752479241874.png"
                alt="Energy Precisions"
                style={{
                  height: isMobile ? '34px' : '42px',
                  maxWidth: isMobile ? '160px' : '200px',
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
                component="nav"
                aria-label="Main navigation"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: { md: 0.65, lg: 1.15 },
                  py: 0.35,
                  px: { md: 0.5, lg: 1 },
                }}
              >
                {menuItems.map((item) => {
                  const parentActive = item.submenu
                    ? isSubmenuParentActive(item)
                    : isPathActive(item.path);
                  const dropdownOpen = hoverNav === item.label;

                  if (item.submenu) {
                    return (
                      <Box
                        key={item.label}
                        onMouseEnter={() => handleNavEnter(item.label)}
                        onMouseLeave={handleNavLeave}
                        sx={{ position: 'relative' }}
                      >
                        <Button
                          component={Link}
                          to={item.path}
                          endIcon={
                            <ArrowDownIcon
                              sx={{
                                fontSize: 17,
                                transition: 'transform 0.2s ease',
                                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                              }}
                            />
                          }
                          sx={navItemSx(parentActive, dropdownOpen)}
                        >
                          {item.label}
                        </Button>

                        {dropdownOpen && (
                          <Paper
                            elevation={0}
                            onMouseEnter={() => handleNavEnter(item.label)}
                            onMouseLeave={handleNavLeave}
                            sx={{
                              position: 'absolute',
                              top: 'calc(100% + 2px)',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              minWidth: 240,
                              py: 1,
                              px: 0.75,
                              borderRadius: homeUi.innerRadius,
                              border: homeUi.cardBorder,
                              boxShadow: homeUi.cardShadowHover,
                              zIndex: theme.zIndex.appBar + 2,
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -10,
                                left: 0,
                                right: 0,
                                height: 10,
                              },
                            }}
                          >
                            <Typography
                              component="p"
                              sx={{
                                px: 1.5,
                                pb: 0.75,
                                mb: 0.5,
                                ...homeUi.badge,
                                color: colors.gray400,
                                borderBottom: homeUi.cardBorder,
                              }}
                            >
                              {item.label === 'Services' ? 'All services' : 'Resources'}
                            </Typography>
                            <Box
                              component={Link}
                              to={item.path}
                              sx={dropdownLinkSx(isPathActive(item.path))}
                            >
                              {item.label === 'Services' ? 'View all services' : 'View all articles'}
                            </Box>
                            {item.submenu.map((sub) => (
                              <Box
                                key={sub.label}
                                component={Link}
                                to={sub.path}
                                sx={dropdownLinkSx(isPathActive(sub.path))}
                              >
                                {sub.label}
                              </Box>
                            ))}
                          </Paper>
                        )}
                      </Box>
                    );
                  }

                  return (
                    <Button
                      key={item.label}
                      component={Link}
                      to={item.path}
                      sx={navItemSx(parentActive)}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            )}

            {/* Right: mobile menu + cart; desktop cart + account */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                justifyContent: 'flex-end',
                justifySelf: 'end',
                flexShrink: 0,
              }}
            >
              {isMobile && (
                <IconButton
                  onClick={handleDrawerToggle}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    border: homeUi.cardBorder,
                    color: colors.blueBlack,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  {mobileOpen ? <CloseIcon sx={{ fontSize: 22 }} /> : <MenuIcon sx={{ fontSize: 22 }} />}
                </IconButton>
              )}
              {!isMobile && (
              <IconButton
                component={Link}
                to="/cart"
                aria-label="Shopping cart"
                sx={{
                  position: 'relative',
                  width: 44,
                  height: 44,
                  color: colors.blueBlack,
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 24 }} />
                {cartCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: colors.green,
                      color: colors.blueBlack,
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...homeUi.badge,
                      fontWeight: 800,
                    }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </Box>
                )}
              </IconButton>
              )}
              {!isMobile && isAuthenticated ? (
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

      <SwipeableDrawer
        anchor="bottom"
        open={mobileOpen}
        onClose={closeDrawer}
        onOpen={() => setMobileOpen(true)}
        disableSwipeToOpen
        disableDiscovery
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: 'min(85dvh, 640px)',
            pb: 'env(safe-area-inset-bottom, 0px)',
            overflow: 'hidden',
            bgcolor: homeUi.glass.bgcolor,
            backdropFilter: homeUi.glass.backdropFilter,
            WebkitBackdropFilter: homeUi.glass.WebkitBackdropFilter,
            border: homeUi.glass.border,
            borderBottom: 'none',
            boxShadow: '0 -8px 40px rgba(10, 14, 23, 0.14)',
          },
        }}
      >
        {mobileMenuSheet}
      </SwipeableDrawer>

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
            px: 0.5,
            pt: 0.35,
            pb: 'max(8px, env(safe-area-inset-bottom))',
            bgcolor: publicUi.bottomNav.bg,
            backdropFilter: publicUi.bottomNav.backdropFilter,
            WebkitBackdropFilter: publicUi.bottomNav.WebkitBackdropFilter,
            borderTop: publicUi.bottomNav.border,
            boxShadow: publicUi.bottomNav.shadow,
          }}
          aria-label="Primary mobile navigation"
        >
          <Box display="flex" alignItems="stretch" justifyContent="space-around">
            {bottomNavItem(
              'home',
              <HomeIcon sx={{ fontSize: 24 }} />,
              'Home',
              '/'
            )}
            {bottomNavItem(
              'shop',
              <StorefrontIcon sx={{ fontSize: 24 }} />,
              'Shop',
              '/shop'
            )}
            {bottomNavItem(
              'services',
              <SolarPowerIcon sx={{ fontSize: 24 }} />,
              'Services',
              '/services'
            )}
            {bottomNavItem(
              'packages',
              <BoltIcon sx={{ fontSize: 24 }} />,
              'Packages',
              '/solar-packages'
            )}
            {bottomNavItem(
              'contact',
              <ContactIcon sx={{ fontSize: 24 }} />,
              'Contact',
              '/contact'
            )}
          </Box>
        </Paper>
      )}
    </>
  );
};

export default Header;

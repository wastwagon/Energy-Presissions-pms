import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  Kitchen as AppliancesIcon,
  ShoppingCart as OrdersIcon,
  PhotoLibrary as MediaIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  MailOutline as MailOutlineIcon,
  LocalOffer as LocalOfferIcon,
  Article as ContentIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { canManageWebsite, filterPmsNav } from '../config/adminNav';

const drawerWidth = 220;

const PMS_NAV_ICONS: Record<string, React.ReactNode> = {
  Dashboard: <DashboardIcon />,
  Customers: <PeopleIcon />,
  Projects: <FolderIcon />,
  Quotes: <DescriptionIcon />,
  Products: <InventoryIcon />,
  Appliances: <AppliancesIcon />,
  Orders: <OrdersIcon />,
  'Website content': <ContentIcon />,
  'Promo codes': <LocalOfferIcon />,
  'Contact leads': <MailOutlineIcon />,
  'Media Library': <MediaIcon />,
  Reports: <AssessmentIcon />,
  Settings: <SettingsIcon />,
};

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.jpg');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  useEffect(() => {
    // Try to load logo, fallback to default if not found
    const img = new Image();
    img.onerror = () => setLogoUrl('/logo.jpg'); // Fallback to default
    img.src = logoUrl;
  }, [logoUrl]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/pms/admin');
  };

  const visibleMenu = filterPmsNav(user?.role);

  const drawer = (
    <div>
      <Toolbar variant="dense" sx={{ minHeight: 52, px: 1.5 }}>
        <Box
          component="img"
          src={logoUrl}
          alt="Energy Precisions Logo"
          sx={{
            height: 40,
            maxWidth: 168,
            objectFit: 'contain',
            mx: 'auto',
          }}
          onError={() => setLogoUrl('/logo.jpg')}
        />
      </Toolbar>
      <List dense sx={{ px: 1, py: 0.5 }}>
        {visibleMenu.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              selected={
                item.path.startsWith('/web/app')
                  ? location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  : location.pathname === item.path
              }
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1.5,
                py: 0.75,
                px: 1.25,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: '1.15rem' } }}>
                {PMS_NAV_ICONS[item.text]}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.8125rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {canManageWebsite(user?.role) && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => {
                  navigate('/web/app');
                  setMobileOpen(false);
                }}
                sx={{ borderRadius: 1.5, py: 0.75, px: 1.25 }}
              >
                <ListItemIcon sx={{ minWidth: 36, '& .MuiSvgIcon-root': { fontSize: '1.15rem' } }}>
                  <OpenInNewIcon />
                </ListItemIcon>
                <ListItemText primary="Website admin" primaryTypographyProps={{ fontSize: '0.8125rem' }} />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Helmet>
        <title>PMS | Energy Precisions</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 48, px: { xs: 1, sm: 2 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' } }}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '0.95rem' }}>
            {visibleMenu.find((item) => item.path === location.pathname)?.text || 'Energy Precision PMS'}
          </Typography>
          <IconButton onClick={handleMenuClick} sx={{ p: 0 }} size="small">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
              {user?.full_name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.full_name}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 48 }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;


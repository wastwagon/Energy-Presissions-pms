import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
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
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  PhotoLibrary as MediaIcon,
  LocalOffer as PromoIcon,
  MailOutline as LeadsIcon,
  MarkEmailRead as NewsletterIcon,
  Article as ContentIcon,
  Logout as LogoutIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const drawerWidth = 220;

type MenuItemT = { text: string; icon: React.ReactNode; path: string; adminOnly?: boolean };

const menuItems: MenuItemT[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/web/app' },
  { text: 'Shop products', icon: <InventoryIcon />, path: '/web/app/products' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/web/app/orders' },
  { text: 'Media', icon: <MediaIcon />, path: '/web/app/media' },
  { text: 'Promo codes', icon: <PromoIcon />, path: '/web/app/promo-codes' },
  { text: 'Contact leads', icon: <LeadsIcon />, path: '/web/app/contact-leads' },
  { text: 'Newsletter', icon: <NewsletterIcon />, path: '/web/app/newsletter' },
  { text: 'Blog & FAQs', icon: <ContentIcon />, path: '/web/app/content' },
];

const WebAdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isNavSelected = (path: string) => {
    const p = location.pathname.replace(/\/$/, '') || '/';
    if (path === '/web/app') return p === '/web/app';
    return p === path || p.startsWith(`${path}/`);
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/web/admin', { replace: true });
  };

  const visibleMenu = menuItems.filter((item) => !item.adminOnly || user?.role === UserRole.ADMIN);

  const drawer = (
    <div>
      <Toolbar variant="dense" sx={{ minHeight: 52, px: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
          Website admin
        </Typography>
      </Toolbar>
      <Divider />
      <List dense sx={{ px: 1, py: 0.5 }}>
        {visibleMenu.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isNavSelected(item.path)}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 1.5, py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 36, '& .MuiSvgIcon-root': { fontSize: '1.15rem' } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: isNavSelected(item.path) ? 600 : 400 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {user?.role === UserRole.ADMIN && (
          <ListItem disablePadding sx={{ mb: 0.25, mt: 1 }}>
            <ListItemButton component={RouterLink} to="/pms/dashboard" sx={{ borderRadius: 1.5, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <OpenInNewIcon sx={{ fontSize: '1.1rem' }} />
              </ListItemIcon>
              <ListItemText primary="Full PMS" primaryTypographyProps={{ fontSize: '0.8125rem' }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </div>
  );

  const title = visibleMenu.find((item) => isNavSelected(item.path))?.text || 'Website admin';

  return (
    <Box sx={{ display: 'flex' }}>
      <Helmet>
        <title>Website admin | Energy Precisions</title>
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
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' } }}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '0.95rem' }} noWrap>
            {title}
          </Typography>
          <IconButton onClick={handleMenuClick} size="small" sx={{ p: 0 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'secondary.main' }}>
              {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.full_name}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem component={RouterLink} to="/" onClick={handleMenuClose}>
              View public site
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
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
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

export default WebAdminLayout;

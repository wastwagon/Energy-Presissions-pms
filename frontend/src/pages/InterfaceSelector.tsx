import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
} from '@mui/material';
import {
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const InterfaceSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a4d7a 0%, #00E676 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}
        >
          Energy Precisions
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'rgba(255,255,255,0.9)', mb: 6 }}
        >
          Choose Your Interface
        </Typography>

        <Grid container spacing={4}>
          {/* Public Website */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <ShoppingCartIcon sx={{ fontSize: 64, color: '#00E676', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Public Website
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Browse our products, shop online, and learn about our solar solutions
                  </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <strong>Features:</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      <li>Product Catalog</li>
                      <li>Online Shopping</li>
                      <li>Company Information</li>
                      <li>Contact & Support</li>
                    </ul>
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/')}
                  sx={{
                    bgcolor: '#00E676',
                    '&:hover': { bgcolor: '#00C85F' },
                    textTransform: 'none',
                    py: 1.5,
                  }}
                >
                  Visit Website
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* PMS Admin */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <DashboardIcon sx={{ fontSize: 64, color: '#1a4d7a', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Project Management System
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage projects, create quotes, generate invoices, and track customers
                  </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <strong>Features:</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      <li>Customer Management</li>
                      <li>Project Tracking</li>
                      <li>Quote Generation</li>
                      <li>Invoice Creation</li>
                      <li>Reports & Analytics</li>
                    </ul>
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/pms/admin')}
                  sx={{
                    bgcolor: '#1a4d7a',
                    '&:hover': { bgcolor: '#0d3a5a' },
                    textTransform: 'none',
                    py: 1.5,
                  }}
                >
                  Login to PMS
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="text"
            onClick={() => navigate('/web/admin')}
            sx={{ color: 'white', textTransform: 'none' }}
          >
            Website Admin Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default InterfaceSelector;

import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import api from '../services/api';

const WebAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ecom, setEcom] = useState({
    ecommerce_order_count: 0,
    ecommerce_paid_orders: 0,
    ecommerce_paid_revenue_ghs: 0,
    ecommerce_pending_payment_orders: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/reports/analytics');
        if (!cancelled && res.data) {
          setEcom({
            ecommerce_order_count: res.data.ecommerce_order_count ?? 0,
            ecommerce_paid_orders: res.data.ecommerce_paid_orders ?? 0,
            ecommerce_paid_revenue_ghs: res.data.ecommerce_paid_revenue_ghs ?? 0,
            ecommerce_pending_payment_orders: res.data.ecommerce_pending_payment_orders ?? 0,
          });
        }
      } catch {
        /* optional */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Shop overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Last 90 days (same window as PMS analytics). Use Reports in full PMS for quote metrics.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Orders
              </Typography>
              <Typography variant="h5">{ecom.ecommerce_order_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Paid orders
              </Typography>
              <Typography variant="h5">{ecom.ecommerce_paid_orders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Paid revenue (GHS)
              </Typography>
              <Typography variant="h5">{ecom.ecommerce_paid_revenue_ghs.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Pending payment
              </Typography>
              <Typography variant="h5">{ecom.ecommerce_pending_payment_orders}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WebAdminDashboard;

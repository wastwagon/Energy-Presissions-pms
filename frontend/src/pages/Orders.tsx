import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import api from '../services/api';

interface OrderItem {
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  shipping_address?: Record<string, unknown>;
  created_at: string;
  items?: OrderItem[];
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  processing: 'primary',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'default',
};

const paymentColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  refunded: 'default',
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<{ el: HTMLElement; order: Order } | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = { limit: 100 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      const response = await api.get('/ecommerce/orders', { params });
      setOrders(response.data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.detail || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  useEffect(() => {
    if (!search) {
      fetchOrders();
      return;
    }
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setAnchorEl({ el: event.currentTarget, order });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetail = async (order: Order) => {
    handleMenuClose();
    setDetailLoading(true);
    setDetailOrder(null);
    try {
      const response = await api.get(`/ecommerce/orders/${order.order_number}`);
      setDetailOrder(response.data);
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (orderNumber: string, field: 'status' | 'payment_status', value: string) => {
    try {
      await api.patch(`/ecommerce/orders/${orderNumber}`, { [field]: value });
      fetchOrders();
      if (detailOrder?.order_number === orderNumber) {
        const res = await api.get(`/ecommerce/orders/${orderNumber}`);
        setDetailOrder(res.data);
      }
    } catch (err: any) {
      console.error('Error updating order:', err);
    } finally {
      handleMenuClose();
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(n);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Orders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage e-commerce orders from the public shop.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search by order #, name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Payment</InputLabel>
          <Select
            value={paymentFilter}
            label="Payment"
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Order #</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                {!isMobile && (
                  <>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                  </>
                )}
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No orders found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {order.customer_name || 'Guest'}
                      </Typography>
                      {order.customer_email && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {order.customer_email}
                        </Typography>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>
                          <Chip
                            label={order.status}
                            size="small"
                            color={statusColors[order.status] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.payment_status}
                            size="small"
                            color={paymentColors[order.payment_status] || 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                      </>
                    )}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order)}
                        aria-label="Order actions"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl?.el}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem onClick={() => anchorEl && handleViewDetail(anchorEl.order)}>
          View details
        </MenuItem>
        <MenuItem
          onClick={() => anchorEl && handleStatusUpdate(anchorEl.order.order_number, 'status', 'processing')}
          disabled={anchorEl?.order.status === 'processing'}
        >
          Mark Processing
        </MenuItem>
        <MenuItem
          onClick={() => anchorEl && handleStatusUpdate(anchorEl.order.order_number, 'status', 'shipped')}
          disabled={anchorEl?.order.status === 'shipped'}
        >
          Mark Shipped
        </MenuItem>
        <MenuItem
          onClick={() => anchorEl && handleStatusUpdate(anchorEl.order.order_number, 'status', 'delivered')}
          disabled={anchorEl?.order.status === 'delivered'}
        >
          Mark Delivered
        </MenuItem>
        <MenuItem
          onClick={() => anchorEl && handleStatusUpdate(anchorEl.order.order_number, 'payment_status', 'paid')}
          disabled={anchorEl?.order.payment_status === 'paid'}
        >
          Mark Paid
        </MenuItem>
      </Menu>

      <Dialog open={detailLoading || Boolean(detailOrder)} onClose={() => setDetailOrder(null)} maxWidth="sm" fullWidth>
        {detailLoading ? (
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </DialogContent>
        ) : detailOrder ? (
          <>
            <DialogTitle>Order {detailOrder.order_number}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Customer
              </Typography>
              <Typography variant="body2" gutterBottom>
                {detailOrder.customer_name || 'Guest'}
              </Typography>
              {detailOrder.customer_email && (
                <Typography variant="body2" gutterBottom>{detailOrder.customer_email}</Typography>
              )}
              {detailOrder.customer_phone && (
                <Typography variant="body2" gutterBottom>{detailOrder.customer_phone}</Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={detailOrder.status} size="small" color={statusColors[detailOrder.status] || 'default'} />
                <Chip label={detailOrder.payment_status} size="small" color={paymentColors[detailOrder.payment_status] || 'default'} />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                Items
              </Typography>
              {(detailOrder.items || []).map((item, i) => (
                <Box key={i} sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2">
                    {item.product_name} × {item.quantity} @ {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}
                  </Typography>
                </Box>
              ))}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Subtotal: {formatCurrency(detailOrder.subtotal)}
              </Typography>
              <Typography variant="body2">Shipping: {formatCurrency(detailOrder.shipping_cost)}</Typography>
              {detailOrder.discount_amount > 0 && (
                <Typography variant="body2">Discount: -{formatCurrency(detailOrder.discount_amount)}</Typography>
              )}
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: {formatCurrency(detailOrder.total_amount)}
              </Typography>
              {detailOrder.shipping_address && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2">
                    {typeof detailOrder.shipping_address === 'object' && detailOrder.shipping_address !== null
                      ? Object.entries(detailOrder.shipping_address)
                          .filter(([, v]) => v)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')
                      : String(detailOrder.shipping_address)}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOrder(null)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => handleStatusUpdate(detailOrder.order_number, 'status', 'processing')}
                disabled={detailOrder.status === 'processing'}
              >
                Mark Processing
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStatusUpdate(detailOrder.order_number, 'payment_status', 'paid')}
                disabled={detailOrder.payment_status === 'paid'}
              >
                Mark Paid
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
};

export default Orders;

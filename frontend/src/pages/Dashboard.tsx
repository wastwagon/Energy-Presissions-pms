import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  People as PeopleIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardStats {
  role: string;
  total_customers: number;
  active_projects: number;
  total_quotes: number;
  quotes_by_status: Record<string, number>;
  accepted_quotes: number;
  conversion_rate: number;
  total_quoted_value: number;
  accepted_value: number;
  pending_quotes: number;
  this_month_quotes: number;
  recent_quotes: Array<{
    id: number;
    quote_number: string;
    customer_name: string;
    project_name: string;
    status: string;
    grand_total: number;
    created_at: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      draft: 'default',
      sent: 'primary',
      accepted: 'success',
      rejected: 'error',
      expired: 'warning',
    };
    return colors[status.toLowerCase()] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="error">Failed to load dashboard statistics</Typography>
      </Box>
    );
  }

  const isSales = stats.role === 'sales';
  const isAdmin = stats.role === 'admin';

  // Define stats cards based on role
  const statCards = isSales
    ? [
        {
          title: 'My Quotes',
          value: stats.total_quotes.toString(),
          icon: <DescriptionIcon />,
          color: '#2c5aa0',
        },
        {
          title: 'Pending Quotes',
          value: stats.pending_quotes.toString(),
          icon: <PendingIcon />,
          color: '#ffa500',
        },
        {
          title: 'Accepted Quotes',
          value: stats.accepted_quotes.toString(),
          icon: <CheckCircleIcon />,
          color: '#4caf50',
        },
        {
          title: 'Conversion Rate',
          value: `${stats.conversion_rate}%`,
          icon: <TrendingUpIcon />,
          color: '#f44336',
        },
        {
          title: 'Total Quote Value',
          value: formatCurrency(stats.total_quoted_value),
          icon: <AttachMoneyIcon />,
          color: '#9c27b0',
        },
        {
          title: 'Accepted Value',
          value: formatCurrency(stats.accepted_value),
          icon: <CheckCircleIcon />,
          color: '#00bcd4',
        },
        {
          title: 'This Month Quotes',
          value: stats.this_month_quotes.toString(),
          icon: <CalendarIcon />,
          color: '#ff9800',
        },
        {
          title: 'Active Projects',
          value: stats.active_projects.toString(),
          icon: <FolderIcon />,
          color: '#607d8b',
        },
      ]
    : [
        {
          title: 'Total Customers',
          value: stats.total_customers.toString(),
          icon: <PeopleIcon />,
          color: '#2c5aa0',
        },
        {
          title: 'Active Projects',
          value: stats.active_projects.toString(),
          icon: <FolderIcon />,
          color: '#ffa500',
        },
        {
          title: 'Quotes Generated',
          value: stats.total_quotes.toString(),
          icon: <DescriptionIcon />,
          color: '#4caf50',
        },
        {
          title: 'Conversion Rate',
          value: `${stats.conversion_rate}%`,
          icon: <TrendingUpIcon />,
          color: '#f44336',
        },
      ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          {isSales ? 'Sales Dashboard' : 'Dashboard'}
        </Typography>
        {isSales && (
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.full_name}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: stat.color,
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box sx={{ mb: 2, fontSize: 48 }}>{stat.icon}</Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Quotes Section */}
      {stats.recent_quotes && stats.recent_quotes.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Quotes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Quote Number</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recent_quotes.map((quote) => (
                    <TableRow
                      key={quote.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/pms/quotes/${quote.id}`)}
                    >
                      <TableCell>{quote.quote_number}</TableCell>
                      <TableCell>{quote.customer_name}</TableCell>
                      <TableCell>{quote.project_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={quote.status.toUpperCase()}
                          color={getStatusColor(quote.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(quote.grand_total)}</TableCell>
                      <TableCell>
                        {quote.created_at
                          ? new Date(quote.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;


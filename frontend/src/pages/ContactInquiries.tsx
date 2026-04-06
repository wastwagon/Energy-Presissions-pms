import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  message: string;
  source?: string | null;
  created_at: string;
}

const ContactInquiries: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rows, setRows] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<ContactInquiry | null>(null);

  const fetchInquiries = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<ContactInquiry[]>('/contact/inquiries', { params: { limit: 200 } });
      setRows(res.data || []);
    } catch (e: any) {
      const msg = e.response?.status === 403 ? 'Admin access required.' : e.response?.data?.detail || 'Failed to load inquiries.';
      setError(typeof msg === 'string' ? msg : 'Failed to load inquiries.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.service && r.service.toLowerCase().includes(q)) ||
      r.message.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Only administrators can view website contact form submissions.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Contact leads
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search name, email, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260 }}
          />
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={18} /> : <RefreshIcon />}
            onClick={() => fetchInquiries()}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Service</TableCell>
                <TableCell align="right">Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No submissions yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>
                      <Typography component="a" href={`mailto:${r.email}`} variant="body2" sx={{ color: 'secondary.main' }}>
                        {r.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{r.phone || '—'}</TableCell>
                    <TableCell>{r.service || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="View message" onClick={() => setDetail(r)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Message from {detail?.name}</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {formatDate(detail.created_at)}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong>{' '}
                <a href={`mailto:${detail.email}`}>{detail.email}</a>
              </Typography>
              {detail.phone && (
                <Typography variant="body2">
                  <strong>Phone:</strong> {detail.phone}
                </Typography>
              )}
              {detail.service && (
                <Typography variant="body2">
                  <strong>Service:</strong> {detail.service}
                </Typography>
              )}
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                {detail.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactInquiries;

import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../services/api';

interface Row {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

const NewsletterSubscribers: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<Row[]>('/newsletter/subscribers', {
        params: { limit: 500, active_only: activeOnly },
      });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeOnly]);

  const toggle = async (row: Row) => {
    try {
      await api.patch(`/newsletter/subscribers/${row.id}`, { is_active: !row.is_active });
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: !r.is_active } : r)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Newsletter subscribers
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <FormControlLabel
            control={<Switch checked={activeOnly} onChange={(_, v) => setActiveOnly(v)} size="small" />}
            label="Active only"
          />
          <IconButton onClick={load} aria-label="refresh" size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Subscribed</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.is_active ? 'Subscribed' : 'Unsubscribed'} color={r.is_active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Switch checked={r.is_active} onChange={() => toggle(r)} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      No subscribers yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default NewsletterSubscribers;

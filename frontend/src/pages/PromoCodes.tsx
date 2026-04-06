import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Block as BlockIcon } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CouponRow {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_amount: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at?: string;
}

const emptyForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: 10,
  minimum_amount: 0,
  usage_limit: '' as string | number,
  expires_at: '',
  is_active: true,
};

const toDatetimeLocal = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const PromoCodes: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rows, setRows] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<CouponRow[]>('/ecommerce/coupons');
      setRows(res.data || []);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load promo codes');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const handleOpenEdit = (row: CouponRow) => {
    setEditing(row);
    setForm({
      code: row.code,
      discount_type: row.discount_type,
      discount_value: row.discount_value,
      minimum_amount: row.minimum_amount,
      usage_limit: row.usage_limit ?? '',
      expires_at: toDatetimeLocal(row.expires_at),
      is_active: row.is_active,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const code = form.code.trim();
    if (!code) {
      setError('Code is required');
      return;
    }
    const usageLimit =
      form.usage_limit === '' || form.usage_limit === null
        ? null
        : Math.max(1, parseInt(String(form.usage_limit), 10) || 0);
    const expiresRaw = form.expires_at?.trim();
    const expires_at = expiresRaw ? new Date(expiresRaw).toISOString() : null;

    const payload: Record<string, unknown> = {
      code: code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      minimum_amount: Number(form.minimum_amount) || 0,
      usage_limit: usageLimit,
      is_active: form.is_active,
    };
    if (expires_at) {
      payload.expires_at = expires_at;
    } else if (editing) {
      payload.expires_at = null;
    }

    try {
      setSaving(true);
      setError(null);
      if (editing) {
        const patchBody = { ...payload };
        delete patchBody.code;
        await api.patch(`/ecommerce/coupons/${editing.id}`, patchBody);
      } else {
        await api.post('/ecommerce/coupons', payload);
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      const d = e.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (row: CouponRow) => {
    if (!window.confirm(`Deactivate coupon ${row.code}? It will no longer work at checkout.`)) return;
    try {
      await api.delete(`/ecommerce/coupons/${row.id}`);
      await load();
    } catch (e: any) {
      const d = e.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Could not deactivate');
    }
  };

  const formatExp = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Only administrators can manage promo codes.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Promo codes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discount codes for the public shop checkout (percentage or fixed GHS).
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ bgcolor: 'secondary.main', textTransform: 'none' }}
        >
          New code
        </Button>
      </Box>

      {error && !open && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Min. order (GHS)</TableCell>
                <TableCell align="center">Uses</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No promo codes yet. Create one for the shop checkout.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} hover sx={{ opacity: r.is_active ? 1 : 0.55 }}>
                    <TableCell sx={{ fontWeight: 700 }}>{r.code}</TableCell>
                    <TableCell>{r.discount_type}</TableCell>
                    <TableCell align="right">
                      {r.discount_type === 'percentage' ? `${r.discount_value}%` : `GHS ${r.discount_value}`}
                    </TableCell>
                    <TableCell align="right">{r.minimum_amount}</TableCell>
                    <TableCell align="center">
                      {r.used_count}
                      {r.usage_limit != null ? ` / ${r.usage_limit}` : ' / ∞'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatExp(r.expires_at)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.is_active ? 'Active' : 'Inactive'}
                        color={r.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEdit(r)} aria-label="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {r.is_active && (
                        <IconButton size="small" onClick={() => handleDeactivate(r)} aria-label="Deactivate" color="warning">
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `Edit ${editing.code}` : 'New promo code'}</DialogTitle>
        <DialogContent dividers>
          {error && open && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            margin="normal"
            disabled={!!editing}
            helperText={editing ? 'Code cannot be changed; create a new coupon for a new code.' : 'Shown to customers (stored uppercase).'}
          />
          <TextField
            fullWidth
            select
            label="Discount type"
            value={form.discount_type}
            onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
            margin="normal"
          >
            <MenuItem value="percentage">Percentage off subtotal</MenuItem>
            <MenuItem value="fixed">Fixed GHS off subtotal</MenuItem>
          </TextField>
          <TextField
            fullWidth
            type="number"
            label={form.discount_type === 'percentage' ? 'Percent (max 100)' : 'Amount (GHS)'}
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Minimum cart subtotal (GHS)"
            value={form.minimum_amount}
            onChange={(e) => setForm({ ...form, minimum_amount: parseFloat(e.target.value) || 0 })}
            margin="normal"
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Usage limit (leave empty for unlimited)"
            value={form.usage_limit}
            onChange={(e) =>
              setForm({ ...form, usage_limit: e.target.value === '' ? '' : parseInt(e.target.value, 10) || '' })
            }
            margin="normal"
            inputProps={{ min: 1, step: 1 }}
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Expiry (optional)"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            }
            label="Active"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ textTransform: 'none' }}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromoCodes;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import api from '../services/api';

const API_BASE = (window as any).REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  title?: string;
  alt_text?: string;
  mime_type?: string;
  file_size?: number;
  created_at: string;
}

const getFullUrl = (url: string) =>
  url.startsWith('http') ? url : `${API_BASE.replace(/\/$/, '')}${url}`;

const MediaLibrary: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const theme = useTheme();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const res = await api.get('/media/', { params });
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (search) {
      const t = setTimeout(fetchItems, 300);
      return () => clearTimeout(t);
    } else {
      fetchItems();
    }
  }, [search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      await api.post('/media/', fd);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm('Delete this media item?')) return;
    try {
      await api.delete(`/media/${item.id}`);
      fetchItems();
      setSelectedItem(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Delete failed');
    }
  };

  const copyUrl = (url: string) => {
    const full = getFullUrl(url);
    navigator.clipboard.writeText(full);
    // Could add snackbar
  };

  const isImage = (mime?: string) =>
    mime?.startsWith('image/') ?? /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(selectedItem?.filename || '');

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Media Library
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload and manage images. Reuse them across products, services, and portfolio.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search media..."
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
          sx={{ minWidth: 260 }}
        />
        <Button
          variant="contained"
          component="label"
          startIcon={<AddIcon />}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add New'}
          <input type="file" hidden accept="image/*,.pdf" onChange={handleUpload} />
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ImageIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography color="text.secondary">No media items yet.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Upload images to reuse across your site.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload
            <input type="file" hidden accept="image/*,.pdf" onChange={handleUpload} />
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                  border: selectedItem?.id === item.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                }}
                onClick={() => setSelectedItem(item)}
              >
                <Box
                  sx={{
                    height: 140,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.mime_type?.startsWith('image/') ? (
                    <Box
                      component="img"
                      src={getFullUrl(item.url)}
                      alt={item.alt_text || item.title || item.filename}
                      sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  )}
                </Box>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" noWrap display="block" title={item.filename}>
                    {item.title || item.filename}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', py: 0 }}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)} maxWidth="sm" fullWidth>
        {selectedItem && (
          <>
            <DialogTitle>{selectedItem.title || selectedItem.filename}</DialogTitle>
            <DialogContent>
              {isImage() ? (
                <Box
                  component="img"
                  src={getFullUrl(selectedItem.url)}
                  alt={selectedItem.alt_text || ''}
                  sx={{ width: '100%', borderRadius: 1 }}
                />
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                  <Typography sx={{ mt: 1 }}>{selectedItem.filename}</Typography>
                </Box>
              )}
              <Typography variant="body2" sx={{ mt: 2, wordBreak: 'break-all' }}>
                URL: {getFullUrl(selectedItem.url)}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={() => copyUrl(selectedItem.url)}
                >
                  Copy URL
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => copyUrl(selectedItem.url)}>Copy URL</Button>
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(selectedItem)}>
                Delete
              </Button>
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MediaLibrary;

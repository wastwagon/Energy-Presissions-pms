import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Image as ImageIcon, Search as SearchIcon, Check as CheckIcon } from '@mui/icons-material';
import api from '../services/api';

const API_BASE = (window as any).REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  title?: string;
  alt_text?: string;
  mime_type?: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  acceptImagesOnly?: boolean;
}

const getFullUrl = (url: string) =>
  url.startsWith('http') ? url : `${API_BASE.replace(/\/$/, '')}${url}`;

const MediaPicker: React.FC<MediaPickerProps> = ({ open, onClose, onSelect, acceptImagesOnly = true }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setSearch('');
      fetchItems();
    }
  }, [open]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const res = await api.get('/media/', { params });
      let data = res.data || [];
      if (acceptImagesOnly) {
        data = data.filter((m: MediaItem) => m.mime_type?.startsWith('image/'));
      }
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && search) {
      const t = setTimeout(fetchItems, 300);
      return () => clearTimeout(t);
    } else if (open) {
      fetchItems();
    }
  }, [search, open]);

  const handleSelect = (item: MediaItem) => {
    onSelect(item.url);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Choose from Media Library</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          size="small"
        />
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box py={6} textAlign="center" color="text.secondary">
            No images found. Upload images in Media Library first.
          </Box>
        ) : (
          <Grid container spacing={1}>
            {items.map((item) => (
              <Grid item xs={4} sm={3} md={2} key={item.id}>
                <Box
                  onClick={() => handleSelect(item)}
                  sx={{
                    aspectRatio: '1',
                    border: '2px solid #e0e0e0',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    '&:hover': { borderColor: '#00E676', boxShadow: 2 },
                  }}
                >
                  {item.mime_type?.startsWith('image/') ? (
                    <Box
                      component="img"
                      src={getFullUrl(item.url)}
                      alt={item.alt_text || item.filename}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaPicker;

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Typography,
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { resolveApiUrl } from '../../utils/apiUrl';
import { resolveMediaUrl } from '../../utils/mediaUrl';

interface MediaItem {
  id: number;
  url: string;
  title?: string;
  original_filename?: string;
  mime_type?: string;
}

interface CmsImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  /** Prefer video preview when URL has no clear extension. */
  mediaType?: 'image' | 'video';
  /** Allow selecting / uploading video files from the media library. */
  acceptVideo?: boolean;
  /** Larger preview useful for portfolio gallery cards. */
  previewSize?: 'sm' | 'md';
}

const looksLikeVideo = (url: string, mediaType?: 'image' | 'video') => {
  if (mediaType === 'video') return true;
  if (mediaType === 'image') return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
};

const CmsImageField: React.FC<CmsImageFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  mediaType,
  acceptVideo = false,
  previewSize = 'sm',
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptAttr = acceptVideo ? 'image/*,video/*' : 'image/*';
  const isVideo = Boolean(value) && looksLikeVideo(value, mediaType);
  const previewHeight = previewSize === 'md' ? 120 : 80;

  const loadMedia = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get<MediaItem[]>('/media/', {
        params: query ? { search: query, limit: 200 } : { limit: 200 },
      });
      let data = res.data || [];
      if (!acceptVideo) {
        data = data.filter(
          (m) =>
            !m.mime_type ||
            m.mime_type.startsWith('image/') ||
            /\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i.test(m.url || m.original_filename || ''),
        );
      }
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setUploadError(null);
    void loadMedia('');
  }, [open, acceptVideo]);

  useEffect(() => {
    if (!open || !search.trim()) return;
    const t = setTimeout(() => void loadMedia(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search, open, acceptVideo]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${resolveApiUrl().replace(/\/$/, '')}/api/media/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!response.ok) {
        let message = 'Upload failed';
        try {
          const body = await response.json();
          if (typeof body?.detail === 'string') message = body.detail;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      const created = (await response.json()) as MediaItem;
      if (created?.url) {
        onChange(created.url);
        setOpen(false);
      } else {
        await loadMedia(search.trim());
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
        <TextField
          size="small"
          fullWidth
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          helperText={helperText}
        />
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ImageIcon />}
            onClick={() => setOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Browse media
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
          {value ? (
            <Button
              variant="text"
              size="small"
              color="inherit"
              startIcon={<ClearIcon />}
              onClick={() => onChange('')}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Clear
            </Button>
          ) : null}
        </Stack>
      </Stack>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept={acceptAttr}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
        }}
      />
      {uploadError && !open && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}
      {value ? (
        <Box
          sx={{
            mt: 1,
            width: previewSize === 'md' ? 200 : 140,
            height: previewHeight,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isVideo ? (
            <Box
              component="video"
              src={resolveMediaUrl(value)}
              muted
              playsInline
              preload="metadata"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box
              component="img"
              src={resolveMediaUrl(value)}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </Box>
      ) : null}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select from media library</DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2, pt: 0.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search media…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              {uploading ? 'Uploading…' : 'Upload new'}
            </Button>
          </Stack>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
              {uploadError}
            </Alert>
          )}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Typography color="text.secondary" py={2}>
              No media found. Upload a file here or under Media in the sidebar.
            </Typography>
          ) : (
            <Grid container spacing={1.5}>
              {items.map((item) => {
                const itemIsVideo =
                  item.mime_type?.startsWith('video/') ||
                  looksLikeVideo(item.url || item.original_filename || '');
                return (
                  <Grid item xs={6} sm={4} md={3} key={item.id}>
                    <Card variant="outlined">
                      <CardActionArea
                        onClick={() => {
                          onChange(item.url);
                          setOpen(false);
                        }}
                      >
                        {itemIsVideo ? (
                          <Box
                            component="video"
                            src={resolveMediaUrl(item.url)}
                            muted
                            playsInline
                            preload="metadata"
                            sx={{ height: 100, width: '100%', objectFit: 'cover', display: 'block', bgcolor: 'grey.200' }}
                          />
                        ) : (
                          <CardMedia
                            component="img"
                            height="100"
                            image={resolveMediaUrl(item.url)}
                            alt={item.title || item.original_filename || 'Media'}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                      </CardActionArea>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          px: 1,
                          py: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={item.title || item.original_filename || item.url}
                      >
                        {item.title || item.original_filename || `Media #${item.id}`}
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CmsImageField;

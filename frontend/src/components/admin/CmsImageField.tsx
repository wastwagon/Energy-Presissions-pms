import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import api from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';

interface MediaItem {
  id: number;
  url: string;
  title?: string;
  original_filename?: string;
}

interface CmsImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
}

const CmsImageField: React.FC<CmsImageFieldProps> = ({ label, value, onChange, helperText }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<MediaItem[]>('/media/', { params: { limit: 60 } })
      .then((res) => {
        if (!cancelled) setItems(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

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
        <Button
          variant="outlined"
          size="small"
          startIcon={<ImageIcon />}
          onClick={() => setOpen(true)}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          Browse media
        </Button>
      </Stack>
      {value && (
        <Box
          component="img"
          src={resolveMediaUrl(value)}
          alt=""
          sx={{ mt: 1, maxHeight: 80, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select image from media library</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Typography color="text.secondary" py={2}>
              No media found. Upload images under Media in the sidebar first.
            </Typography>
          ) : (
            <Grid container spacing={1.5} sx={{ pt: 1 }}>
              {items.map((item) => (
                <Grid item xs={6} sm={4} md={3} key={item.id}>
                  <Card variant="outlined">
                    <CardActionArea
                      onClick={() => {
                        onChange(item.url);
                        setOpen(false);
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="100"
                        image={resolveMediaUrl(item.url)}
                        alt={item.title || item.original_filename || 'Media'}
                        sx={{ objectFit: 'cover' }}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CmsImageField;

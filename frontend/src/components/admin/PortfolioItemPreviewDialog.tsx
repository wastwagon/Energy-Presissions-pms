import React from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import type { CmsPortfolioGalleryItem } from '../../types/cms';
import { cmsPortfolioItemToPage, getPortfolioItemPath } from '../../data/portfolioCms';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { PortfolioBodyView } from '../../utils/portfolioBody';

type Props = {
  open: boolean;
  item: CmsPortfolioGalleryItem | null;
  onClose: () => void;
};

const PortfolioItemPreviewDialog: React.FC<Props> = ({ open, item, onClose }) => {
  if (!item) return null;
  const pageItem = cmsPortfolioItemToPage(item);
  const isPublished = item.published !== false;
  const gallery = [pageItem.image, ...(pageItem.galleryImages || [])].filter(Boolean);
  const unique = gallery.filter((url, i) => gallery.indexOf(url) === i);
  const extras = unique.slice(1);
  const fallbackBody = `${pageItem.description} Energy Precisions delivers turnkey design, installation, and lifecycle support for projects like this across Ghana.`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Draft preview
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.5 }}>
          How this project will look on the public case study (unsaved edits included). Path:{' '}
          {getPortfolioItemPath(pageItem)}
          {!isPublished ? ' · currently draft (hidden on live site until Published)' : ''}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip size="small" label={pageItem.category || 'Uncategorized'} />
          <Chip size="small" label={pageItem.location || 'Ghana'} variant="outlined" />
          {pageItem.systemSize && <Chip size="small" label={pageItem.systemSize} variant="outlined" />}
          {pageItem.featured && <Chip size="small" color="primary" label="Featured" />}
          {!isPublished && <Chip size="small" color="warning" label="Draft" />}
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {pageItem.title || 'Untitled project'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {pageItem.description || 'No short description yet.'}
        </Typography>

        {pageItem.image ? (
          <Box
            sx={{
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.100',
            }}
          >
            {pageItem.mediaType === 'video' ? (
              <Box
                component="video"
                src={resolveMediaUrl(pageItem.image)}
                controls
                playsInline
                sx={{ width: '100%', maxHeight: 360, display: 'block' }}
              />
            ) : (
              <Box
                component="img"
                src={resolveMediaUrl(pageItem.image)}
                alt={pageItem.title}
                sx={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }}
              />
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No cover media set.
          </Typography>
        )}

        {extras.length > 0 && (
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {extras.map((url) => (
              <Grid item xs={4} key={url}>
                <Box
                  component="img"
                  src={resolveMediaUrl(url)}
                  alt=""
                  sx={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {(pageItem.projectType || pageItem.savingsNote) && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            {pageItem.projectType && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  Project type
                </Typography>
                <Typography variant="body2">{pageItem.projectType}</Typography>
              </Box>
            )}
            {pageItem.savingsNote && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  Outcome
                </Typography>
                <Typography variant="body2">{pageItem.savingsNote}</Typography>
              </Box>
            )}
          </Stack>
        )}

        <PortfolioBodyView body={pageItem.body} fallback={fallbackBody} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortfolioItemPreviewDialog;

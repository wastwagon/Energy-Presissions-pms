import React from 'react';
import { Box, Typography, Button, Stack, Rating } from '@mui/material';
import { Star as StarIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { COMPANY } from '../../data/companyContact';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

/** Google reviews CTA — replace googleMapsReviewUrl when you have a direct Place/reviews link */
const GoogleReviewsBand: React.FC = () => (
  <Box
    sx={{
      ...publicUi.card,
      p: { xs: 2.5, md: 3 },
      mb: { xs: 4, md: 5 },
      bgcolor: colors.offWhite,
      textAlign: { xs: 'center', md: 'left' },
    }}
  >
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'center', md: 'center' }}
      justifyContent="space-between"
    >
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 1 }}>
          <StarIcon sx={{ color: colors.green }} />
          <Typography sx={{ fontWeight: 700, color: colors.blueBlack }}>Google reviews</Typography>
        </Stack>
        <Rating value={5} readOnly size="small" sx={{ color: colors.green, mb: 1 }} />
        <Typography sx={{ ...publicUi.mutedText, fontSize: '0.875rem', maxWidth: 480 }}>
          See what customers say on Google Maps, or leave a review after your project — it helps other Ghanaians find reliable solar installers.
        </Typography>
      </Box>
      <Button
        component="a"
        href={COMPANY.googleMapsReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
        sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget, flexShrink: 0, px: 2.5 }}
      >
        View on Google
      </Button>
    </Stack>
  </Box>
);

export default GoogleReviewsBand;

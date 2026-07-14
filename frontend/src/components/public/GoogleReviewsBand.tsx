import React from 'react';
import { Box, Typography, Button, Stack, Rating, Link } from '@mui/material';
import { Star as StarIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { googleMapsEmbedUrl, googleMapsReadUrl, googleMapsWriteReviewUrl } from '../../utils/googleMaps';
import { useCmsPage } from '../../hooks/useCmsPage';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { formatReviewCountLabel, resolveGoogleReviewDisplay } from '../../utils/googleReviewDisplay';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

const GoogleReviewsBand: React.FC = () => {
  const { sections: globalSections } = useCmsPage('global');
  const { sections: homeSections } = useCmsPage('home');
  const { contact } = useGlobalSiteConfig();
  const googleReviews = globalSections.google_reviews;
  const display = resolveGoogleReviewDisplay(googleReviews, homeSections.testimonials?.items);
  const countLabel = formatReviewCountLabel(display.reviewCount, display.source);
  const placeId = googleReviews?.place_id;
  const embedUrl = googleMapsEmbedUrl(placeId, contact);

  return (
    <Box
      sx={{
        ...publicUi.card,
        p: { xs: 2.5, md: 3 },
        mb: { xs: 4, md: 5 },
        bgcolor: colors.offWhite,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={3}
        alignItems={{ xs: 'stretch', lg: 'flex-start' }}
      >
        <Box sx={{ flex: 1, textAlign: { xs: 'center', lg: 'left' } }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={{ xs: 'center', lg: 'flex-start' }}
            sx={{ mb: 1 }}
          >
            <StarIcon sx={{ color: colors.green }} />
            <Typography sx={{ fontWeight: 700, color: colors.blueBlack }}>Google reviews</Typography>
          </Stack>
          {display.rating != null && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', lg: 'flex-start' }}
              sx={{ mb: 1 }}
            >
              <Rating value={display.rating} readOnly precision={0.1} size="small" sx={{ color: colors.green }} />
              <Typography sx={{ fontWeight: 600, ...homeUi.navLink, color: colors.blueBlack }}>
                {display.rating.toFixed(1)}
              </Typography>
            </Stack>
          )}
          {countLabel && (
            <Typography sx={{ ...homeUi.caption, ...publicUi.mutedText, mb: 1 }}>
              {countLabel}
              {display.source === 'testimonials' ? ' on this site' : ''}
            </Typography>
          )}
          <Typography sx={{ ...publicUi.mutedText, maxWidth: 480, mx: { xs: 'auto', lg: 0 } }}>
            {display.source === 'google'
              ? 'See what customers say on Google Maps, or leave a review after your project — it helps other Ghanaians find reliable solar installers.'
              : 'Read verified feedback on our reviews page, or share your experience on Google Maps after your project.'}
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', lg: 'flex-start' }} sx={{ mt: 2 }}>
            <Button
              component="a"
              href={googleMapsReadUrl(placeId, contact)}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget, px: 2.5 }}
            >
              Read on Google
            </Button>
            <Button
              component="a"
              href={googleMapsWriteReviewUrl(placeId, contact)}
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              sx={{ textTransform: 'none', color: colors.blueNavy, fontWeight: 600 }}
            >
              Write a review
            </Button>
          </Stack>
        </Box>

        {embedUrl && (
          <Box
            sx={{
              flex: { lg: '0 0 340px' },
              width: { xs: '100%', lg: 340 },
              borderRadius: homeUi.innerRadius,
              overflow: 'hidden',
              border: homeUi.cardBorder,
              minHeight: 220,
            }}
          >
            <Box
              component="iframe"
              title="Energy Precisions on Google Maps"
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sx={{ width: '100%', height: 220, border: 0, display: 'block' }}
            />
          </Box>
        )}
      </Stack>
      <Typography sx={{ ...publicUi.mutedText, ...homeUi.chip, mt: 2, textAlign: 'center' }}>
        Map data © Google ·{' '}
        <Link href={googleMapsReadUrl(placeId, contact)} target="_blank" rel="noopener noreferrer" sx={{ color: colors.gray600 }}>
          Open in Google Maps
        </Link>
      </Typography>
    </Box>
  );
};

export default GoogleReviewsBand;

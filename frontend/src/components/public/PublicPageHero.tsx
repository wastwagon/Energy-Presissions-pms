import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

type Props = {
  badge?: string;
  headline: string;
  headlineHighlight?: string;
  description?: string;
  backgroundImage?: string | null;
  align?: 'left' | 'center';
};

const PublicPageHero: React.FC<Props> = ({
  badge,
  headline,
  headlineHighlight,
  description,
  backgroundImage,
  align = 'left',
}) => (
  <Box
    sx={{
      bgcolor: colors.blueBlack,
      color: 'white',
      py: publicUi.hero.py,
      position: 'relative',
      overflow: 'hidden',
      ...(backgroundImage
        ? {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(${publicUi.hero.overlay}, ${publicUi.hero.overlay}), url(${JSON.stringify(backgroundImage)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
            },
          }
        : {}),
    }}
  >
    <Container maxWidth="lg" sx={{ px: publicUi.containerPx, position: 'relative', zIndex: 1 }}>
      <Box
        textAlign={align}
        sx={{
          maxWidth: align === 'center' ? 720 : 560,
          mx: align === 'center' ? 'auto' : 0,
        }}
      >
        {badge && (
          <Typography
            component="p"
            sx={{
              color: colors.green,
              fontWeight: 600,
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              mb: 1.25,
            }}
          >
            {badge}
          </Typography>
        )}

        <Typography
          component="h1"
          sx={{
            ...homeUi.title,
            fontSize: homeUi.sectionTitle.fontSize,
            lineHeight: homeUi.sectionTitle.lineHeight,
            mb: description ? { xs: 1, md: 1.5 } : 0,
          }}
        >
          {headline}{' '}
          {headlineHighlight && (
            <Box component="span" sx={{ color: colors.green }}>
              {headlineHighlight}
            </Box>
          )}
        </Typography>

        {description && (
          <Typography
            sx={{
              ...homeUi.body,
              color: publicUi.hero.subtitle,
              maxWidth: align === 'center' ? 560 : 520,
              mx: align === 'center' ? 'auto' : 0,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Container>
  </Box>
);

export default PublicPageHero;

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { resolveMediaUrl } from '../../utils/mediaUrl';

type Props = {
  badge?: string;
  headline: string;
  headlineHighlight?: string;
  description?: string;
  backgroundImage?: string | null;
  align?: 'left' | 'center';
  /** Larger headline for flagship pages (About, packages) */
  headlineSize?: 'default' | 'prominent';
  children?: React.ReactNode;
};

const PublicPageHero: React.FC<Props> = ({
  badge,
  headline,
  headlineHighlight,
  description,
  backgroundImage,
  align = 'left',
  headlineSize = 'default',
  children,
}) => {
  const headlineFontSize =
    headlineSize === 'prominent'
      ? { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
      : homeUi.sectionTitle.fontSize;
  const heroBg = backgroundImage ? resolveMediaUrl(backgroundImage) : '';
  return (
  <Box
    sx={{
      bgcolor: colors.blueBlack,
      color: 'white',
      py: publicUi.hero.py,
      position: 'relative',
      overflow: 'hidden',
      ...(heroBg
        ? {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(${publicUi.hero.overlay}, ${publicUi.hero.overlay}), url(${JSON.stringify(heroBg)})`,
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
            fontSize: headlineFontSize,
            lineHeight: headlineSize === 'prominent' ? 1.12 : homeUi.sectionTitle.lineHeight,
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

        {children && <Box sx={{ mt: description ? 2.5 : 0 }}>{children}</Box>}
      </Box>
    </Container>
  </Box>
  );
};

export default PublicPageHero;

import React from 'react';
import { Box, Container } from '@mui/material';
import PublicPageHero from './PublicPageHero';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

type Props = {
  badge?: string;
  headline: string;
  headlineHighlight?: string;
  description?: string;
  backgroundImage?: string | null;
  heroAlign?: 'left' | 'center';
  /** lg for most pages, md for narrow reading layouts */
  contentMaxWidth?: 'lg' | 'md' | 'xl';
  contentPy?: typeof homeUi.sectionPy | { xs: number; md: number };
  children: React.ReactNode;
};

const PublicPageShell: React.FC<Props> = ({
  badge,
  headline,
  headlineHighlight,
  description,
  backgroundImage,
  heroAlign = 'left',
  contentMaxWidth = 'lg',
  contentPy = { xs: 4, md: 6 },
  children,
}) => (
  <Box sx={{ bgcolor: publicUi.pageBg, minHeight: '40vh' }}>
    <PublicPageHero
      badge={badge}
      headline={headline}
      headlineHighlight={headlineHighlight}
      description={description}
      backgroundImage={backgroundImage}
      align={heroAlign}
    />
    <Box component="section" sx={{ py: contentPy }}>
      <Container maxWidth={contentMaxWidth} sx={{ px: publicUi.containerPx }}>
        {children}
      </Container>
    </Box>
  </Box>
);

export default PublicPageShell;

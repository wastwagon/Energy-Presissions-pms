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
  headlineSize?: 'default' | 'prominent';
  /** Optional CTAs or stats rendered inside the hero band */
  heroChildren?: React.ReactNode;
  /** Content between hero and main container (e.g. financing hero cards) */
  beforeContent?: React.ReactNode;
  /** lg for most pages, md for narrow reading layouts */
  contentMaxWidth?: 'lg' | 'md' | 'xl';
  contentPy?: typeof homeUi.sectionPy | { xs: number; md: number };
  /** When false, children render without an inner Container (multi-band pages like Services) */
  wrapContent?: boolean;
  children: React.ReactNode;
};

const PublicPageShell: React.FC<Props> = ({
  badge,
  headline,
  headlineHighlight,
  description,
  backgroundImage,
  heroAlign = 'left',
  headlineSize = 'default',
  heroChildren,
  beforeContent,
  contentMaxWidth = 'lg',
  contentPy = { xs: 4, md: 6 },
  wrapContent = true,
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
      headlineSize={headlineSize}
    >
      {heroChildren}
    </PublicPageHero>
    {beforeContent}
    {wrapContent ? (
      <Box component="section" sx={{ py: contentPy }}>
        <Container maxWidth={contentMaxWidth} sx={{ px: publicUi.containerPx }}>
          {children}
        </Container>
      </Box>
    ) : (
      <Box component="section">{children}</Box>
    )}
  </Box>
);

export default PublicPageShell;

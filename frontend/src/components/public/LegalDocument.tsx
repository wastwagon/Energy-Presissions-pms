import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import { Seo } from '../Seo';
import PublicPageHero from './PublicPageHero';
import { homeUi } from '../../theme/homeUi';
import { colors } from '../../theme/colors';

type Section = {
  title: string;
  body: string;
};

type Props = {
  title: string;
  badge: string;
  description: string;
  path: string;
  sections: Section[];
};

const LegalDocument: React.FC<Props> = ({ title, badge, description, path, sections }) => (
  <Box>
    <Seo title={`${title} | Energy Precisions`} description={description} path={path} />
    <PublicPageHero badge={badge} headline={title} description={description} />
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: homeUi.pageBg }}>
      <Container maxWidth="md" sx={{ px: homeUi.containerPx }}>
        <Stack spacing={3.5}>
          {sections.map((section) => (
            <Box key={section.title}>
              <Typography
                sx={{
                  ...homeUi.title,
                  fontSize: { xs: '1.0625rem', md: '1.125rem' },
                  color: colors.blueBlack,
                  mb: 1,
                }}
              >
                {section.title}
              </Typography>
              <Typography sx={{ ...homeUi.body, color: colors.gray600, whiteSpace: 'pre-line' }}>
                {section.body}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default LegalDocument;

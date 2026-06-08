import React from 'react';
import { Typography, Stack } from '@mui/material';
import { Seo } from '../Seo';
import PublicPageShell from './PublicPageShell';
import { homeUi } from '../../theme/homeUi';
import { colors } from '../../theme/colors';

type Section = {
  title: string;
  body: string;
};

type Props = {
  seoTitle: string;
  seoDescription: string;
  badge: string;
  title: string;
  description: string;
  path: string;
  sections: Section[];
};

const LegalDocument: React.FC<Props> = ({
  seoTitle,
  seoDescription,
  badge,
  title,
  description,
  path,
  sections,
}) => (
  <>
    <Seo title={seoTitle} description={seoDescription} path={path} />
    <PublicPageShell badge={badge} headline={title} description={description} contentMaxWidth="md">
      <Stack spacing={3.5}>
        {sections.map((section) => (
          <Stack key={section.title} spacing={1}>
            <Typography
              sx={{
                ...homeUi.title,
                fontSize: { xs: '1.0625rem', md: '1.125rem' },
                color: colors.blueBlack,
              }}
            >
              {section.title}
            </Typography>
            <Typography sx={{ ...homeUi.body, color: colors.gray600, whiteSpace: 'pre-line' }}>
              {section.body}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </PublicPageShell>
  </>
);

export default LegalDocument;

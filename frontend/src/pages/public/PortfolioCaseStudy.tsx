import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import PublicPageHero from '../../components/public/PublicPageHero';
import { useCmsPage } from '../../hooks/useCmsPage';
import { getPortfolioItemByIdFromCms, resolvePortfolioItems } from '../../data/portfolioCms';
import { SITE_CTA } from '../../data/siteCta';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

const PortfolioCaseStudy: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sections } = useCmsPage('portfolio');
  const items = useMemo(() => resolvePortfolioItems(sections.items), [sections.items]);
  const item = getPortfolioItemByIdFromCms(id, sections.items);

  if (!item) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: homeUi.pageBg }}>
        <Seo title="Project not found" description="Portfolio project." path={`/portfolio/${id || ''}`} noIndex />
        <Typography sx={{ mb: 2 }}>Project not found.</Typography>
        <Button component={RouterLink} to="/portfolio" sx={publicUi.secondaryButton} variant="outlined">
          Back to portfolio
        </Button>
      </Box>
    );
  }

  const related = items.filter((p) => p.id !== item.id && p.category === item.category).slice(0, 3);

  return (
    <Box sx={{ bgcolor: homeUi.pageBg }}>
      <Seo
        title={`${item.title} | Portfolio | Energy Precisions`}
        description={item.description}
        path={`/portfolio/${item.id}`}
        ogImage={item.mediaType !== 'video' ? item.image : undefined}
      />
      <PublicPageHero badge={item.category} headline={item.title} description={item.description} />

      <Container maxWidth="lg" sx={{ px: publicUi.containerPx, py: { xs: 4, md: 6 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/portfolio')}
          sx={{ mb: 3, textTransform: 'none', color: colors.blueNavy }}
        >
          All projects
        </Button>

        <Box
          sx={{
            borderRadius: homeUi.cardRadius,
            overflow: 'hidden',
            border: homeUi.cardBorder,
            mb: 3,
            bgcolor: colors.gray100,
          }}
        >
          {item.mediaType === 'video' ? (
            <Box component="video" src={item.image} controls playsInline sx={{ width: '100%', maxHeight: 480, display: 'block' }} />
          ) : (
            <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', maxHeight: 520, objectFit: 'cover', display: 'block' }} />
          )}
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
          <Chip label={item.location} size="small" sx={{ bgcolor: colors.blueBlack, color: 'white' }} />
          <Chip label={item.category} size="small" variant="outlined" />
          {item.systemSize && <Chip label={item.systemSize} size="small" sx={{ bgcolor: colors.greenLight, color: colors.blueBlack }} />}
        </Stack>

        {(item.projectType || item.savingsNote) && (
          <Grid container spacing={2} sx={{ mb: 3, maxWidth: 640 }}>
            {item.projectType && (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: colors.gray600, mb: 0.5 }}>Project type</Typography>
                <Typography sx={{ ...homeUi.body, color: colors.blueBlack }}>{item.projectType}</Typography>
              </Grid>
            )}
            {item.savingsNote && (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: colors.gray600, mb: 0.5 }}>Outcome</Typography>
                <Typography sx={{ ...homeUi.body, color: colors.blueBlack }}>{item.savingsNote}</Typography>
              </Grid>
            )}
          </Grid>
        )}

        <Typography sx={{ ...homeUi.body, ...publicUi.mutedText, mb: 4, maxWidth: 640 }}>
          {item.description} Energy Precisions delivers turnkey design, installation, and lifecycle support for projects like this across Ghana.
        </Typography>

        <Button
          component={RouterLink}
          to={SITE_CTA.quoteHref}
          variant="contained"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
          sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, mb: 5 }}
        >
          {SITE_CTA.consultation}
        </Button>

        {related.length > 0 && (
          <>
            <Typography sx={{ ...homeUi.title, fontSize: '1.125rem', mb: 2 }}>More in {item.category}</Typography>
            <Grid container spacing={2}>
              {related.map((rel) => (
                <Grid item xs={12} sm={4} key={rel.id}>
                  <Button
                    component={RouterLink}
                    to={`/portfolio/${rel.id}`}
                    fullWidth
                    variant="outlined"
                    sx={{ ...publicUi.secondaryButton, py: 1.5, justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    {rel.title}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PortfolioCaseStudy;

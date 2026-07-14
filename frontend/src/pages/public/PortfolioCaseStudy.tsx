import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { useCmsPage } from '../../hooks/useCmsPage';
import { getPortfolioItemByIdFromCms, resolvePortfolioItems } from '../../data/portfolioCms';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

const PortfolioCaseStudy: React.FC = () => {
  const { cta } = useGlobalSiteConfig();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sections } = useCmsPage('portfolio');
  const items = useMemo(() => resolvePortfolioItems(sections.items), [sections.items]);
  const item = getPortfolioItemByIdFromCms(id, sections.items);

  if (!item) {
    return (
      <>
        <Seo title="Project not found | Energy Precisions" description="Portfolio project." path={`/portfolio/${id || ''}`} noIndex />
        <PublicPageShell
          badge="Portfolio"
          headline="Project not found"
          description="This case study may have moved or the link is outdated. Browse our completed installations across Ghana."
          heroAlign="center"
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button component={RouterLink} to="/portfolio" variant="contained" sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget }}>
              View all projects
            </Button>
            <Button component={RouterLink} to={cta.quoteHref} variant="outlined" sx={{ ...publicUi.secondaryButton, ...homeUi.touchTarget }}>
              {cta.consultation}
            </Button>
          </Stack>
        </PublicPageShell>
      </>
    );
  }

  const related = items.filter((p) => p.id !== item.id && p.category === item.category).slice(0, 3);

  return (
    <>
      <Seo
        title={`${item.title} | Portfolio | Energy Precisions`}
        description={item.description}
        path={`/portfolio/${item.id}`}
        ogImage={item.mediaType !== 'video' ? resolveMediaUrl(item.image) : undefined}
      />
      <PublicPageShell badge={item.category} headline={item.title} description={item.description} contentMaxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/portfolio')}
          sx={{
            mb: 3,
            textTransform: 'none',
            color: colors.blueNavy,
            ...homeUi.touchTarget,
            justifyContent: 'flex-start',
            px: 0,
          }}
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
            <Box component="video" src={resolveMediaUrl(item.image)} controls playsInline sx={{ width: '100%', maxHeight: 480, display: 'block' }} />
          ) : (
            <Box component="img" src={resolveMediaUrl(item.image)} alt={item.title} sx={{ width: '100%', maxHeight: 520, objectFit: 'cover', display: 'block' }} />
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
                <Typography sx={{ ...homeUi.caption, fontWeight: 700, color: colors.gray600, mb: 0.5 }}>Project type</Typography>
                <Typography sx={{ ...homeUi.body, color: colors.blueBlack }}>{item.projectType}</Typography>
              </Grid>
            )}
            {item.savingsNote && (
              <Grid item xs={12} sm={6}>
                <Typography sx={{ ...homeUi.caption, fontWeight: 700, color: colors.gray600, mb: 0.5 }}>Outcome</Typography>
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
          to={cta.quoteHref}
          variant="contained"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
          sx={{
            ...publicUi.primaryButton,
            ...homeUi.touchTarget,
            mb: 5,
            display: { xs: 'none', md: 'inline-flex' },
          }}
        >
          {cta.consultation}
        </Button>

        {related.length > 0 && (
          <>
            <Typography sx={{ ...homeUi.headingSm, mb: 2 }}>More in {item.category}</Typography>
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
      </PublicPageShell>
      <PublicStickyMobileCta label={cta.consultation} to={cta.quoteHref} />
    </>
  );
};

export default PortfolioCaseStudy;

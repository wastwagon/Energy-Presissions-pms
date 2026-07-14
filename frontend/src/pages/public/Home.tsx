import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import HomeCredibility from '../../components/public/HomeCredibility';
import HomeHero from '../../components/public/HomeHero';
import HomePortfolioSection from '../../components/public/HomePortfolioSection';
import HomeProcessSection from '../../components/public/HomeProcessSection';
import HomeServicesSection from '../../components/public/HomeServicesSection';
import HomeTestimonialsSection from '../../components/public/HomeTestimonialsSection';
import HomeToolsStrip from '../../components/public/HomeToolsStrip';
import { useCmsPage } from '../../hooks/useCmsPage';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { localBusinessJsonLd } from '../../utils/jsonLd';

const Home: React.FC = () => {
  const { sections } = useCmsPage('home');
  const { contact, cta } = useGlobalSiteConfig();
  const seo = resolveCmsSeo(sections, {
    title: 'Energy Precisions | Ghana Energy Transition · Solar & Hybrid Power',
    description:
      "Partner in Ghana's energy transition: hybrid solar, lithium storage, turnkey installation and lifecycle support for homes, business and industry. Accra-based, nationwide.",
  });

  const hero = sections.hero;

  return (
    <Box sx={{ bgcolor: homeUi.pageBg }}>
      <Seo title={seo.title} description={seo.description} path="/" jsonLd={localBusinessJsonLd(contact)} />

      <HomeHero />

      <HomeCredibility />

      <HomeServicesSection
        badge={sections.services_section?.badge}
        title={sections.services_section?.title}
        subtitle={sections.services_section?.subtitle}
        items={sections.service_cards?.items || []}
        viewAllText={sections.service_cards?.view_all_text}
        viewAllLink={sections.service_cards?.view_all_link}
      />

      <HomePortfolioSection
        badge={sections.portfolio?.badge}
        title={sections.portfolio?.title}
        subtitle={sections.portfolio?.subtitle}
        items={sections.portfolio?.items || []}
        ctaText={sections.portfolio?.cta_text}
        ctaLink={sections.portfolio?.cta_link}
      />

      <HomeProcessSection
        badge={sections.process?.badge}
        title={sections.process?.title}
        subtitle={sections.process?.subtitle}
        steps={sections.process?.steps || []}
      />

      <HomeTestimonialsSection
        badge={sections.testimonials?.badge}
        title={sections.testimonials?.title}
        subtitle={sections.testimonials?.subtitle}
        items={sections.testimonials?.items || []}
      />

      <HomeToolsStrip
        tools={[
          { label: hero?.link1_text || 'Solar size estimator', url: hero?.link1_url || '/solar-estimate', icon: 'estimate' },
          { label: hero?.link2_text || 'Appliance load calculator', url: hero?.link2_url || '/load-calculator', icon: 'calculator' },
        ]}
      />

      <Box
        component="section"
        sx={{
          py: homeUi.sectionPy,
          bgcolor: colors.blueBlack,
          color: 'white',
        }}
      >
        <Container maxWidth="sm" sx={{ px: homeUi.containerPx, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              ...homeUi.title,
              fontSize: homeUi.sectionTitle.fontSize,
              mb: 2,
              color: 'white',
            }}
          >
            {sections.closing_cta?.title}
          </Typography>
          <Typography
            sx={{
              ...homeUi.body,
              color: 'rgba(255,255,255,0.78)',
              mb: 3,
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            {sections.closing_cta?.subtitle}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} justifyContent="center">
            <Button
              variant="contained"
              component={Link}
              to={sections.closing_cta?.primary_cta_link || cta.quoteHref}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...homeUi.touchTarget,
                borderRadius: 999,
                px: 3.5,
                textTransform: 'none',
                ...homeUi.body,
                fontWeight: 600,
                bgcolor: colors.green,
                color: colors.blueBlack,
                boxShadow: 'none',
                '&:hover': { bgcolor: colors.greenDark, boxShadow: 'none' },
              }}
            >
              {sections.closing_cta?.primary_cta_text || cta.consultation}
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to={sections.closing_cta?.secondary_cta_link || '/shop'}
              sx={{
                ...homeUi.touchTarget,
                borderRadius: 999,
                px: 3.5,
                textTransform: 'none',
                ...homeUi.body,
                fontWeight: 600,
                borderColor: 'rgba(255,255,255,0.35)',
                color: 'white',
                '&:hover': { borderColor: 'rgba(255,255,255,0.55)', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              {sections.closing_cta?.secondary_cta_text}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

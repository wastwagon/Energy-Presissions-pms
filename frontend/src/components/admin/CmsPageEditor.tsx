import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '../../services/api';
import { CMS_PAGE_LABELS, getCmsDefaults } from '../../data/cmsDefaults';
import { DEFAULT_CMS_PORTFOLIO_ITEMS } from '../../data/portfolioCms';
import { HYBRID_PACKAGES } from '../../data/hybridPackages';
import type {
  CmsFooter,
  CmsHeaderNavItem,
  CmsHero,
  CmsHeroSlide,
  CmsLink,
  CmsPageSlug,
  CmsPackageTier,
  CmsPortfolioGalleryItem,
  CmsServiceCard,
  CmsSeo,
  LegalContentSection,
  LocationCmsItem,
} from '../../types/cms';
import { resolveHeroSlides } from '../../utils/heroSlides';
import CmsImageField from './CmsImageField';

const PAGES: CmsPageSlug[] = [
  'home',
  'about',
  'services',
  'shop',
  'cart',
  'checkout',
  'checkout_success',
  'contact',
  'global',
  'packages',
  'financing',
  'portfolio',
  'blog',
  'reviews',
  'referral',
  'privacy',
  'terms',
  'warranty',
  'locations',
  'faqs',
  'solar_estimate',
  'load_calculator',
];

const featuresToText = (features: string[] = []) => features.join('\n');
const textToFeatures = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);

type SectionsState = Record<string, unknown>;

const CmsPageEditor: React.FC = () => {
  const [page, setPage] = useState<CmsPageSlug>('home');
  const [sections, setSections] = useState<SectionsState>(
    getCmsDefaults('home') as unknown as SectionsState,
  );
  const [storedSections, setStoredSections] = useState<SectionsState>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async (slug: CmsPageSlug) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ sections: SectionsState; stored_sections: SectionsState }>(
        `/content/admin/pages/${slug}`,
      );
      setSections((res.data.sections || getCmsDefaults(slug)) as SectionsState);
      setStoredSections(res.data.stored_sections || {});
    } catch (e) {
      console.error(e);
      setSections(getCmsDefaults(slug) as unknown as SectionsState);
      setStoredSections({});
      setError('Could not load page content. Showing defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(page);
  }, [page]);

  const setHeroField = (field: keyof CmsHero, value: string) => {
    setSections((s) => ({
      ...s,
      hero: { ...(s.hero as CmsHero), [field]: value },
    }));
  };

  const setHeroStat = (index: number, field: 'value' | 'label', value: string) => {
    setSections((s) => {
      const hero = { ...(s.hero as CmsHero) };
      const stats = [...(hero.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return { ...s, hero: { ...hero, stats } };
    });
  };

  const setHeroPillar = (index: number, value: string) => {
    setSections((s) => {
      const hero = { ...(s.hero as CmsHero) };
      const pillars = [...(hero.pillars || [])];
      pillars[index] = value;
      return { ...s, hero: { ...hero, pillars } };
    });
  };

  const setHeroSlide = (
    index: number,
    field: keyof CmsHeroSlide,
    value: string,
  ) => {
    setSections((s) => {
      const hero = { ...(s.hero as CmsHero) };
      const slides = [...resolveHeroSlides(hero)];
      slides[index] = { ...slides[index], [field]: value };
      return { ...s, hero: { ...hero, slides } };
    });
  };

  const setHeroSlider = (field: 'autoplay_seconds', value: number) => {
    setSections((s) => {
      const hero = { ...(s.hero as CmsHero) };
      return {
        ...s,
        hero: {
          ...hero,
          slider: { ...(hero.slider || { autoplay_seconds: 7 }), [field]: value },
        },
      };
    });
  };

  const setNested = (section: string, field: string, value: string) => {
    setSections((s) => ({
      ...s,
      [section]: { ...(s[section] as Record<string, string>), [field]: value },
    }));
  };

  const setCredibilityField = (field: 'eyebrow' | 'headline', value: string) => {
    setSections((s) => ({
      ...s,
      credibility: { ...(s.credibility as Record<string, unknown>), [field]: value },
    }));
  };

  const setCredibilityProof = (index: number, field: 'title' | 'description', value: string) => {
    setSections((s) => {
      const cred = s.credibility as { proofs: { title: string; description: string }[] } & Record<string, unknown>;
      const proofs = [...(cred?.proofs || [])];
      proofs[index] = { ...proofs[index], [field]: value };
      return { ...s, credibility: { ...cred, proofs } };
    });
  };

  const setFeature = (index: number, field: 'title' | 'description', value: string) => {
    setSections((s) => {
      const why = s.why_choose as { features: { title: string; description: string }[] } & Record<string, string>;
      const features = [...(why?.features || [])];
      features[index] = { ...features[index], [field]: value };
      return { ...s, why_choose: { ...why, features } };
    });
  };

  const setTestimonial = (
    index: number,
    field: 'name' | 'location' | 'role' | 'text',
    value: string,
  ) => {
    setSections((s) => {
      const t = s.testimonials as { items: { name: string; location: string; role: string; text: string; rating: number }[] } & Record<string, string>;
      const items = [...(t?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...s, testimonials: { ...t, items } };
    });
  };

  const setCtaField = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      closing_cta: { ...(s.closing_cta as Record<string, string>), [field]: value },
    }));
  };

  const setPortfolioGalleryItem = (index: number, field: keyof CmsPortfolioGalleryItem, value: string | number | boolean) => {
    setSections((s) => {
      const items = [...((s.items as CmsPortfolioGalleryItem[]) || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...s, items };
    });
  };

  const loadBundledPortfolioItems = () => {
    setSections((s) => ({ ...s, items: DEFAULT_CMS_PORTFOLIO_ITEMS.map((item) => ({ ...item })) }));
  };

  const setServiceCard = (
    sectionKey: 'service_cards',
    index: number,
    field: keyof CmsServiceCard | 'features_text',
    value: string,
  ) => {
    setSections((s) => {
      const block = s[sectionKey] as { items: CmsServiceCard[] } & Record<string, string>;
      const items = [...(block?.items || [])];
      const current = { ...items[index] };
      if (field === 'features_text') {
        current.features = textToFeatures(value);
      } else if (field === 'title') current.title = value;
      else if (field === 'description') current.description = value;
      else if (field === 'image') current.image = value;
      else if (field === 'link') current.link = value;
      else if (field === 'button_text') current.button_text = value;
      items[index] = current;
      return { ...s, [sectionKey]: { ...block, items } };
    });
  };

  const setPortfolioItem = (index: number, field: string, value: string) => {
    setSections((s) => {
      const block = s.portfolio as { items: Record<string, string>[] } & Record<string, string>;
      const items = [...(block?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...s, portfolio: { ...block, items } };
    });
  };

  const setProcessStep = (index: number, field: string, value: string) => {
    setSections((s) => {
      const block = s.process as { steps: Record<string, string>[] } & Record<string, string>;
      const steps = [...(block?.steps || [])];
      steps[index] = { ...steps[index], [field]: value };
      return { ...s, process: { ...block, steps } };
    });
  };

  const setSpecialty = (index: number, value: string) => {
    setSections((s) => {
      const block = s.specialties as { items: string[] } & Record<string, string>;
      const items = [...(block?.items || [])];
      items[index] = value;
      return { ...s, specialties: { ...block, items } };
    });
  };

  const setImpactStat = (index: number, field: string, value: string) => {
    setSections((s) => {
      const block = s.impact_stats as { items: Record<string, string>[]; title: string };
      const items = [...(block?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...s, impact_stats: { ...block, items } };
    });
  };

  const setShopHero = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      hero: { ...(s.hero as Record<string, string>), [field]: value },
    }));
  };

  const setMissionVision = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      mission_vision: { ...(s.mission_vision as Record<string, string>), [field]: value },
    }));
  };

  const setVisitUs = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      visit_us: { ...(s.visit_us as Record<string, string>), [field]: value },
    }));
  };

  const setGuarantee = (index: number, field: 'title' | 'desc', value: string) => {
    setSections((s) => {
      const block = s.guarantees as { items: { title: string; desc: string }[] } & Record<string, string>;
      const items = [...(block?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...s, guarantees: { ...block, items } };
    });
  };

  const setContactBlock = (blockKey: 'hero' | 'sidebar' | 'form', field: string, value: string) => {
    setSections((s) => ({
      ...s,
      [blockKey]: { ...(s[blockKey] as Record<string, string>), [field]: value },
    }));
  };

  const setSeoField = (field: keyof CmsSeo, value: string) => {
    setSections((s) => ({
      ...s,
      seo: { ...(s.seo as CmsSeo), [field]: value },
    }));
  };

  const setSimpleHeroField = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      hero: { ...(s.hero as Record<string, string>), [field]: value },
    }));
  };

  const setSiteContactField = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      contact: { ...(s.contact as Record<string, string>), [field]: value },
    }));
  };

  const setSiteSocialField = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      social: { ...(s.social as Record<string, string>), [field]: value },
    }));
  };

  const setSiteCtaField = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      cta: { ...(s.cta as Record<string, string>), [field]: value },
    }));
  };

  const setGlobalHeroStat = (index: number, field: 'value' | 'label', value: string) => {
    setSections((s) => {
      const block = (s.hero_stats as { items: { value: string; label: string }[] }) || { items: [] };
      const items = [...(block.items || [])];
      items[index] = { ...(items[index] || { value: '', label: '' }), [field]: value };
      return { ...s, hero_stats: { items } };
    });
  };

  const setGlobalImpactTitle = (value: string) => {
    setSections((s) => ({
      ...s,
      impact_stats: { ...(s.impact_stats as object), title: value },
    }));
  };

  const setGlobalImpactStat = (
    index: number,
    field: 'value' | 'label' | 'description',
    value: string,
  ) => {
    setSections((s) => {
      const block = (s.impact_stats as { title?: string; items: Record<string, string>[] }) || {
        title: '',
        items: [],
      };
      const items = [...(block.items || [])];
      items[index] = { ...(items[index] || {}), [field]: value };
      return { ...s, impact_stats: { ...block, items } };
    });
  };

  const setWarrantySummaryField = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      warranty_summary: { ...(s.warranty_summary as Record<string, string>), [field]: value },
    }));
  };

  const setGoogleReviewsField = (field: 'rating' | 'review_count' | 'place_id', value: string) => {
    setSections((s) => {
      const current = (s.google_reviews as { rating: number; review_count: number; place_id?: string }) || {
        rating: 0,
        review_count: 0,
        place_id: '',
      };
      if (field === 'place_id') {
        return {
          ...s,
          google_reviews: { ...current, place_id: value },
        };
      }
      const parsed = Number(value.replace(/,/g, ''));
      return {
        ...s,
        google_reviews: {
          ...current,
          [field]: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
        },
      };
    });
  };

  const setFooterField = (field: string, value: string) => {
    setSections((s) => {
      const footer = { ...(s.footer as Record<string, unknown>) };
      return { ...s, footer: { ...footer, [field]: value } };
    });
  };

  const setHeaderMenuItem = (index: number, field: 'label' | 'path', value: string) => {
    setSections((s) => {
      const header = { ...(s.header as { menu_items: CmsHeaderNavItem[] }) };
      const items = [...(header.menu_items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...s, header: { ...header, menu_items: items } };
    });
  };

  const setHeaderSubmenuItem = (
    menuIndex: number,
    subIndex: number,
    field: keyof CmsLink,
    value: string,
  ) => {
    setSections((s) => {
      const header = { ...(s.header as { menu_items: CmsHeaderNavItem[] }) };
      const items = [...(header.menu_items || [])];
      const submenu = [...(items[menuIndex].submenu || [])];
      submenu[subIndex] = { ...submenu[subIndex], [field]: value };
      items[menuIndex] = { ...items[menuIndex], submenu };
      return { ...s, header: { ...header, menu_items: items } };
    });
  };

  const setFooterLink = (
    listKey: 'quick_links' | 'other_links' | 'service_links' | 'tools_links' | 'legal_links',
    index: number,
    field: keyof CmsLink,
    value: string,
  ) => {
    setSections((s) => {
      const footer = { ...(s.footer as Record<string, unknown>) };
      const links = [...((footer[listKey] as CmsLink[]) || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...s, footer: { ...footer, [listKey]: links } };
    });
  };

  const setFinancingContent = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      content: { ...(s.content as Record<string, string>), [field]: value },
    }));
  };

  const setFinancingSteps = (text: string) => {
    setSections((s) => ({
      ...s,
      content: { ...(s.content as Record<string, unknown>), steps: textToFeatures(text) },
    }));
  };

  const setHeroCard = (index: number, field: 'title' | 'body', value: string) => {
    setSections((s) => {
      const cards = [...((s.hero_cards as { title: string; body: string }[]) || [])];
      cards[index] = { ...cards[index], [field]: value };
      return { ...s, hero_cards: cards };
    });
  };

  const setPackagesSection = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      packages_section: { ...(s.packages_section as Record<string, string>), [field]: value },
    }));
  };

  const setLegalSection = (index: number, field: 'title' | 'body', value: string) => {
    setSections((s) => {
      const blocks = [...((s.content_sections as LegalContentSection[]) || [])];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...s, content_sections: blocks };
    });
  };

  const setLocationItem = (index: number, field: keyof LocationCmsItem, value: string) => {
    setSections((s) => {
      const items = [...((s.items as LocationCmsItem[]) || [])];
      if (field === 'highlights' || field === 'services') {
        items[index] = { ...items[index], [field]: textToFeatures(value) };
      } else {
        items[index] = { ...items[index], [field]: value };
      }
      return { ...s, items };
    });
  };

  const setReadingGuide = (field: 'title' | 'points_text', value: string) => {
    setSections((s) => {
      const guide = { ...(s.reading_guide as { title: string; points: string[] }) };
      if (field === 'points_text') {
        return { ...s, reading_guide: { ...guide, points: textToFeatures(value) } };
      }
      return { ...s, reading_guide: { ...guide, [field]: value } };
    });
  };

  const setWhySection = (field: string, value: string) => {
    setSections((s) => ({
      ...s,
      why_section: { ...(s.why_section as Record<string, string>), [field]: value },
    }));
  };

  const setWhyFeature = (index: number, field: 'title' | 'description', value: string) => {
    setSections((s) => {
      const block = s.why_section as { features: { title: string; description: string }[] } & Record<string, unknown>;
      const features = [...(block?.features || [])];
      features[index] = { ...features[index], [field]: value };
      return { ...s, why_section: { ...block, features } };
    });
  };

  const setWhyFooterPoints = (text: string) => {
    setSections((s) => ({
      ...s,
      why_section: { ...(s.why_section as Record<string, unknown>), footer_points: textToFeatures(text) },
    }));
  };

  const setEcommerceField = (field: string, value: string) => {
    setSections((s) => ({ ...s, [field]: value }));
  };

  const setEmptyStateField = (field: 'title' | 'cta_text', value: string) => {
    setSections((s) => ({
      ...s,
      empty_state: { ...((s.empty_state as Record<string, string>) || {}), [field]: value },
    }));
  };

  const setTierPrice = (packageId: string, value: string) => {
    const parsed = Number(value.replace(/,/g, ''));
    setSections((s) => {
      const current = { ...((s.tier_prices as Record<string, number>) || {}) };
      if (!value.trim() || Number.isNaN(parsed) || parsed <= 0) {
        delete current[packageId];
      } else {
        current[packageId] = Math.round(parsed);
      }
      return { ...s, tier_prices: current };
    });
  };

  const setPackageTierField = (index: number, field: keyof CmsPackageTier, value: string) => {
    setSections((s) => {
      const tiers = [...((s.package_tiers as CmsPackageTier[]) || [])];
      if (!tiers[index]) return s;
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...s, package_tiers: tiers };
    });
  };

  const setPackageTierSpec = (
    index: number,
    field: 'inverter' | 'storage' | 'panels' | 'solar_kw',
    value: string,
  ) => {
    setSections((s) => {
      const tiers = [...((s.package_tiers as CmsPackageTier[]) || [])];
      if (!tiers[index]) return s;
      tiers[index] = {
        ...tiers[index],
        specs: { ...tiers[index].specs, [field]: value },
      };
      return { ...s, package_tiers: tiers };
    });
  };

  const setPackageTierLines = (index: number, field: 'highlights' | 'components', text: string) => {
    setSections((s) => {
      const tiers = [...((s.package_tiers as CmsPackageTier[]) || [])];
      if (!tiers[index]) return s;
      tiers[index] = { ...tiers[index], [field]: textToFeatures(text) };
      return { ...s, package_tiers: tiers };
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const saved = await api.put(`/content/admin/pages/${page}`, { sections });
      setSections(saved.data.sections);
      setStoredSections(saved.data.stored_sections);
      setMessage('Page content saved. Changes appear on the public site immediately.');
    } catch (e) {
      console.error(e);
      setError('Save failed. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (
      !window.confirm(
        `Reset "${CMS_PAGE_LABELS[page]}" to bundled defaults? Custom saved content for this page will be removed.`,
      )
    ) {
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.post<{ sections: SectionsState; stored_sections: SectionsState }>(
        `/content/admin/pages/${page}/reset`,
      );
      setSections(res.data.sections);
      setStoredSections(res.data.stored_sections || {});
      setMessage('Page reset to defaults. The public site now uses bundled content for this page.');
    } catch (e) {
      console.error(e);
      setError('Reset failed. Deploy the latest backend or check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const hero = (sections.hero || {}) as CmsHero;
  const homeHeroSlides = resolveHeroSlides(hero);
  const credibility = (sections.credibility || { proofs: [] }) as {
    eyebrow: string;
    headline: string;
    proofs: { title: string; description: string }[];
  };
  const whyChoose = (sections.why_choose || {}) as { badge: string; title: string; subtitle: string; features: { title: string; description: string }[] };
  const testimonials = (sections.testimonials || { items: [] }) as {
    badge: string;
    title: string;
    subtitle: string;
    items: { name: string; location: string; role: string; text: string; rating: number }[];
  };
  const closingCta = (sections.closing_cta || {}) as Record<string, string>;
  const servicesSection = (sections.services_section || {}) as Record<string, string>;
  const serviceCards = (sections.service_cards || { items: [] }) as {
    items: CmsServiceCard[];
    view_all_text?: string;
    view_all_link?: string;
  };
  const portfolio = (sections.portfolio || { items: [] }) as {
    badge: string;
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    items: { title: string; image: string; alt: string; link: string }[];
  };
  const processSection = (sections.process || { steps: [] }) as {
    badge: string;
    title: string;
    subtitle: string;
    steps: { step: string; title: string; desc: string }[];
  };
  const specialties = (sections.specialties || { items: [] }) as {
    badge: string;
    title: string;
    subtitle: string;
    items: string[];
  };
  const impactStats = (sections.impact_stats || { items: [] }) as {
    title: string;
    items: { value: string; label: string; description: string }[];
  };
  const shopHero = (sections.hero || {}) as { badge: string; headline: string; description: string };
  const contactHero = (sections.hero || {}) as { title: string; quote_title: string; subtitle: string };
  const contactSidebar = (sections.sidebar || {}) as { phone_label: string; email_label: string; location_label: string };
  const contactForm = (sections.form || {}) as { submit_text: string; success_message: string };
  const missionVision = (sections.mission_vision || {}) as Record<string, string>;
  const aboutWhyChoose = (sections.why_choose || { features: [] }) as {
    badge: string;
    title: string;
    subtitle: string;
    features: { title: string; description: string }[];
  };
  const visitUs = (sections.visit_us || {}) as Record<string, string>;
  const guarantees = (sections.guarantees || { items: [] }) as {
    badge: string;
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  const servicesClosingCta = (sections.closing_cta || {}) as Record<string, string>;
  const seo = (sections.seo || {}) as CmsSeo;
  const footer = (sections.footer || {}) as Partial<CmsFooter>;
  const headerMenu = ((sections.header as { menu_items?: CmsHeaderNavItem[] })?.menu_items ||
    []) as CmsHeaderNavItem[];
  const simpleHero = (sections.hero || {}) as Record<string, string>;
  const financingContent = (sections.content || {}) as Record<string, string | string[]>;
  const heroCards = (sections.hero_cards || []) as { title: string; body: string }[];
  const packagesSection = (sections.packages_section || {}) as Record<string, string>;
  const readingGuide = (sections.reading_guide || { points: [] }) as { title: string; points: string[] };
  const whySection = (sections.why_section || { features: [], footer_points: [] }) as {
    title: string;
    features: { title: string; description: string }[];
    footer_points: string[];
    warranty_note: string;
    validity_note: string;
    contact_cta_text: string;
  };
  const tierPrices = (sections.tier_prices || {}) as Record<string, number>;
  const packageTiers = (sections.package_tiers || []) as CmsPackageTier[];
  const emptyState = (sections.empty_state || {}) as { title?: string; cta_text?: string };
  const portfolioGalleryItems = (sections.items || []) as CmsPortfolioGalleryItem[];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={2}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Page</InputLabel>
          <Select label="Page" value={page} onChange={(e) => setPage(e.target.value as CmsPageSlug)}>
            {PAGES.map((p) => (
              <MenuItem key={p} value={p}>
                {CMS_PAGE_LABELS[p]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={save}
          disabled={saving}
        >
          Save page
        </Button>
        <Button variant="outlined" onClick={resetToDefaults} disabled={saving}>
          Reset to defaults
        </Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {page !== 'global' && page !== 'locations' && (
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
          Hero section
        </Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          {page === 'contact' ? (
            <>
              <TextField size="small" label="Page title" value={contactHero.title || ''} onChange={(e) => setContactBlock('hero', 'title', e.target.value)} />
              <TextField size="small" label="Quote request title" value={contactHero.quote_title || ''} onChange={(e) => setContactBlock('hero', 'quote_title', e.target.value)} />
              <TextField size="small" label="Subtitle" value={contactHero.subtitle || ''} onChange={(e) => setContactBlock('hero', 'subtitle', e.target.value)} multiline minRows={2} />
            </>
          ) : page === 'shop' || page === 'portfolio' || page === 'blog' || page === 'reviews' || page === 'referral' || page === 'privacy' || page === 'terms' || page === 'warranty' || page === 'faqs' || page === 'solar_estimate' || page === 'load_calculator' || page === 'cart' || page === 'checkout' || page === 'checkout_success' ? (
            <>
              <TextField size="small" label="Badge" value={shopHero.badge || ''} onChange={(e) => setShopHero('badge', e.target.value)} />
              <TextField size="small" label="Headline" value={shopHero.headline || ''} onChange={(e) => setShopHero('headline', e.target.value)} />
              <TextField size="small" label="Description" value={shopHero.description || ''} onChange={(e) => setShopHero('description', e.target.value)} multiline minRows={3} />
            </>
          ) : page === 'financing' || page === 'packages' ? (
            <>
              <TextField size="small" label="Badge" value={simpleHero.badge || ''} onChange={(e) => setSimpleHeroField('badge', e.target.value)} />
              <TextField size="small" label="Headline" value={simpleHero.headline || ''} onChange={(e) => setSimpleHeroField('headline', e.target.value)} />
              <TextField size="small" label="Description" value={simpleHero.description || ''} onChange={(e) => setSimpleHeroField('description', e.target.value)} multiline minRows={3} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField size="small" label="Primary button text" value={simpleHero.primary_cta_text || ''} onChange={(e) => setSimpleHeroField('primary_cta_text', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Primary link" value={simpleHero.primary_cta_link || ''} onChange={(e) => setSimpleHeroField('primary_cta_link', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField size="small" label="Secondary button text" value={simpleHero.secondary_cta_text || ''} onChange={(e) => setSimpleHeroField('secondary_cta_text', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Secondary link" value={simpleHero.secondary_cta_link || ''} onChange={(e) => setSimpleHeroField('secondary_cta_link', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
            </>
          ) : page === 'home' ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The homepage hero shows one slide at a time — badge, headline, short text, one button, and image. Edit slides below.
              </Typography>
              <TextField
                size="small"
                type="number"
                label="Autoplay seconds (0 = off)"
                value={hero.slider?.autoplay_seconds ?? 7}
                onChange={(e) => setHeroSlider('autoplay_seconds', Number(e.target.value) || 0)}
                inputProps={{ min: 0, max: 60 }}
                sx={{ maxWidth: 220 }}
              />
            </>
          ) : (
            <>
              <TextField size="small" label="Badge" value={hero.badge || ''} onChange={(e) => setHeroField('badge', e.target.value)} />
              <TextField size="small" label="Headline" value={hero.headline || ''} onChange={(e) => setHeroField('headline', e.target.value)} />
              <TextField size="small" label="Headline highlight (green text)" value={hero.headline_highlight || ''} onChange={(e) => setHeroField('headline_highlight', e.target.value)} />
              <TextField size="small" label="Description" value={hero.description || ''} onChange={(e) => setHeroField('description', e.target.value)} multiline minRows={3} />
              <CmsImageField label="Hero image" value={hero.hero_image || ''} onChange={(v) => setHeroField('hero_image', v)} />
              <TextField size="small" label="Image overlay chip" value={hero.image_overlay || ''} onChange={(e) => setHeroField('image_overlay', e.target.value)} />
              <Divider />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Stats</Typography>
              {(hero.stats || []).map((stat, i) => (
                <Stack key={i} direction="row" spacing={1}>
                  <TextField size="small" label="Value" value={stat.value} onChange={(e) => setHeroStat(i, 'value', e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" label="Label" value={stat.label} onChange={(e) => setHeroStat(i, 'label', e.target.value)} sx={{ flex: 2 }} />
                </Stack>
              ))}
              <Divider />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Call-to-action buttons</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField size="small" label="Primary button text" value={hero.primary_cta_text || ''} onChange={(e) => setHeroField('primary_cta_text', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Primary link" value={hero.primary_cta_link || ''} onChange={(e) => setHeroField('primary_cta_link', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField size="small" label="Secondary button text" value={hero.secondary_cta_text || ''} onChange={(e) => setHeroField('secondary_cta_text', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Secondary link" value={hero.secondary_cta_link || ''} onChange={(e) => setHeroField('secondary_cta_link', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
            </>
          )}
        </Box>
      </Paper>
      )}

      {page === 'home' && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            Hero slides
          </Typography>
          {homeHeroSlides.map((slide, i) => (
            <Box key={i} sx={{ mb: 2.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Slide {i + 1}</Typography>
              <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Badge" value={slide.badge} onChange={(e) => setHeroSlide(i, 'badge', e.target.value)} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Headline" value={slide.headline} onChange={(e) => setHeroSlide(i, 'headline', e.target.value)} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Headline highlight (green text)" value={slide.headline_highlight} onChange={(e) => setHeroSlide(i, 'headline_highlight', e.target.value)} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Description" value={slide.description} onChange={(e) => setHeroSlide(i, 'description', e.target.value)} multiline minRows={3} />
              <Box sx={{ mb: 1 }}>
                <CmsImageField label="Slide image" value={slide.hero_image} onChange={(v) => setHeroSlide(i, 'hero_image', v)} />
              </Box>
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Image overlay chip" value={slide.image_overlay} onChange={(e) => setHeroSlide(i, 'image_overlay', e.target.value)} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField size="small" label="Primary button" value={slide.primary_cta_text} onChange={(e) => setHeroSlide(i, 'primary_cta_text', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Primary link" value={slide.primary_cta_link} onChange={(e) => setHeroSlide(i, 'primary_cta_link', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField size="small" label="Secondary button" value={slide.secondary_cta_text} onChange={(e) => setHeroSlide(i, 'secondary_cta_text', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Secondary link" value={slide.secondary_cta_link} onChange={(e) => setHeroSlide(i, 'secondary_cta_link', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
            </Box>
          ))}
        </Paper>
      )}

      {page === 'global' && (
        <>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Site settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Contact details, social profiles, and primary call-to-action — used in the header, footer, contact page, and across the site.
          </Typography>
          <Typography variant="overline" sx={{ display: 'block', mb: 1 }}>Contact</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="Company name" value={(sections.contact as { name?: string })?.name || ''} onChange={(e) => setSiteContactField('name', e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="Tagline" value={(sections.contact as { tagline?: string })?.tagline || ''} onChange={(e) => setSiteContactField('tagline', e.target.value)} sx={{ flex: 2 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="Phone (E.164)" value={(sections.contact as { phone?: string })?.phone || ''} onChange={(e) => setSiteContactField('phone', e.target.value)} sx={{ flex: 1 }} helperText="e.g. +233533611611" />
            <TextField size="small" label="Phone display" value={(sections.contact as { phone_display?: string })?.phone_display || ''} onChange={(e) => setSiteContactField('phone_display', e.target.value)} sx={{ flex: 1 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="WhatsApp (digits)" value={(sections.contact as { whatsapp?: string })?.whatsapp || ''} onChange={(e) => setSiteContactField('whatsapp', e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="WhatsApp label" value={(sections.contact as { whatsapp_display?: string })?.whatsapp_display || ''} onChange={(e) => setSiteContactField('whatsapp_display', e.target.value)} sx={{ flex: 1 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="Email (primary)" value={(sections.contact as { email_primary?: string })?.email_primary || ''} onChange={(e) => setSiteContactField('email_primary', e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="Email (sales)" value={(sections.contact as { email_sales?: string })?.email_sales || ''} onChange={(e) => setSiteContactField('email_sales', e.target.value)} sx={{ flex: 1 }} />
          </Stack>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Full address" value={(sections.contact as { address_full?: string })?.address_full || ''} onChange={(e) => setSiteContactField('address_full', e.target.value)} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Office region note" value={(sections.contact as { office_region_note?: string })?.office_region_note || ''} onChange={(e) => setSiteContactField('office_region_note', e.target.value)} multiline minRows={2} />
          <Typography variant="overline" sx={{ display: 'block', mb: 1, mt: 2 }}>Social profiles</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="Facebook URL" value={(sections.social as { facebook?: string })?.facebook || ''} onChange={(e) => setSiteSocialField('facebook', e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="X (Twitter) URL" value={(sections.social as { twitter?: string })?.twitter || ''} onChange={(e) => setSiteSocialField('twitter', e.target.value)} sx={{ flex: 1 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="LinkedIn URL" value={(sections.social as { linkedin?: string })?.linkedin || ''} onChange={(e) => setSiteSocialField('linkedin', e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="Instagram URL" value={(sections.social as { instagram?: string })?.instagram || ''} onChange={(e) => setSiteSocialField('instagram', e.target.value)} sx={{ flex: 1 }} />
          </Stack>
          <Typography variant="overline" sx={{ display: 'block', mb: 1, mt: 2 }}>Primary CTA</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="Button label" value={(sections.cta as { consultation?: string })?.consultation || ''} onChange={(e) => setSiteCtaField('consultation', e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="Quote link" value={(sections.cta as { quote_href?: string })?.quote_href || ''} onChange={(e) => setSiteCtaField('quote_href', e.target.value)} sx={{ flex: 1 }} />
          </Stack>
          <TextField size="small" fullWidth label="Package survey link" value={(sections.cta as { survey_href?: string })?.survey_href || ''} onChange={(e) => setSiteCtaField('survey_href', e.target.value)} helperText="Used for package and site-assessment CTAs" />
          <Typography variant="overline" sx={{ display: 'block', mb: 1, mt: 2 }}>Hero stat strip</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Short figures shown on the home hero and about page header. Use verifiable product or capability stats — not inflated vanity metrics.
          </Typography>
          {((sections.hero_stats as { items?: { value: string; label: string }[] })?.items || []).map((stat, i) => (
            <Stack key={`hero-stat-${i}`} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" label="Value" value={stat.value || ''} onChange={(e) => setGlobalHeroStat(i, 'value', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Label" value={stat.label || ''} onChange={(e) => setGlobalHeroStat(i, 'label', e.target.value)} sx={{ flex: 2 }} />
            </Stack>
          ))}
          <Typography variant="overline" sx={{ display: 'block', mb: 1, mt: 2 }}>Impact stats (about page)</Typography>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Section title" value={(sections.impact_stats as { title?: string })?.title || ''} onChange={(e) => setGlobalImpactTitle(e.target.value)} />
          {((sections.impact_stats as { items?: { value: string; label: string; description: string }[] })?.items || []).map((stat, i) => (
            <Box key={`impact-stat-${i}`} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField size="small" label="Value" value={stat.value || ''} onChange={(e) => setGlobalImpactStat(i, 'value', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Label" value={stat.label || ''} onChange={(e) => setGlobalImpactStat(i, 'label', e.target.value)} sx={{ flex: 2 }} />
              </Stack>
              <TextField size="small" fullWidth label="Description" value={stat.description || ''} onChange={(e) => setGlobalImpactStat(i, 'description', e.target.value)} multiline minRows={2} />
            </Box>
          ))}
          <Typography variant="overline" sx={{ display: 'block', mb: 1, mt: 2 }}>Warranty summary</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Canonical marketing copy for warranty — keep aligned with the /warranty legal page and hybrid package cards.
          </Typography>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Headline" value={(sections.warranty_summary as { headline?: string })?.headline || ''} onChange={(e) => setWarrantySummaryField('headline', e.target.value)} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Workmanship" value={(sections.warranty_summary as { workmanship?: string })?.workmanship || ''} onChange={(e) => setWarrantySummaryField('workmanship', e.target.value)} multiline minRows={2} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Equipment" value={(sections.warranty_summary as { equipment?: string })?.equipment || ''} onChange={(e) => setWarrantySummaryField('equipment', e.target.value)} multiline minRows={2} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Shop note" value={(sections.warranty_summary as { shop_note?: string })?.shop_note || ''} onChange={(e) => setWarrantySummaryField('shop_note', e.target.value)} multiline minRows={2} />
          <TextField size="small" fullWidth label="Details page path" value={(sections.warranty_summary as { details_path?: string })?.details_path || ''} onChange={(e) => setWarrantySummaryField('details_path', e.target.value)} />
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Google reviews band</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Shown on /reviews. Leave rating at 0 to use the average from homepage testimonials instead of a hardcoded score.
            Add a Google Place ID for direct Maps embed and review links (no API key required).
          </Typography>
          <TextField
            size="small"
            fullWidth
            label="Google Place ID (optional)"
            value={(sections.google_reviews as { place_id?: string })?.place_id || ''}
            onChange={(e) => setGoogleReviewsField('place_id', e.target.value)}
            sx={{ mb: 1.5 }}
            helperText="Find in Google Business Profile → Share → Embed map, or use a Place ID lookup tool."
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              size="small"
              type="number"
              label="Google rating (1–5)"
              value={(sections.google_reviews as { rating?: number })?.rating || ''}
              onChange={(e) => setGoogleReviewsField('rating', e.target.value)}
              inputProps={{ min: 0, max: 5, step: 0.1 }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              label="Google review count"
              value={(sections.google_reviews as { review_count?: number })?.review_count || ''}
              onChange={(e) => setGoogleReviewsField('review_count', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Header navigation</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Main site menu (desktop dropdowns and mobile drawer). Items with sub-links show a flyout menu.
          </Typography>
          {headerMenu.map((item, i) => (
            <Box key={`header-${i}`} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  label="Menu label"
                  value={item.label}
                  onChange={(e) => setHeaderMenuItem(i, 'label', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Path"
                  value={item.path}
                  onChange={(e) => setHeaderMenuItem(i, 'path', e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>
              {(item.submenu || []).map((sub, j) => (
                <Stack key={`header-${i}-sub-${j}`} direction="row" spacing={1} sx={{ mb: 1, pl: 2 }}>
                  <TextField
                    size="small"
                    label="Submenu label"
                    value={sub.label}
                    onChange={(e) => setHeaderSubmenuItem(i, j, 'label', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Submenu path"
                    value={sub.path}
                    onChange={(e) => setHeaderSubmenuItem(i, j, 'path', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              ))}
            </Box>
          ))}
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Footer</Typography>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Company name" value={footer.company_name || ''} onChange={(e) => setFooterField('company_name', e.target.value)} />
          <TextField size="small" fullWidth sx={{ mb: 2 }} label="Tagline" value={footer.tagline || ''} onChange={(e) => setFooterField('tagline', e.target.value)} multiline minRows={2} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Quick links heading" value={footer.quick_links_title || ''} onChange={(e) => setFooterField('quick_links_title', e.target.value)} />
          {(footer.quick_links || []).map((link, i) => (
            <Stack key={`quick-${i}`} direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" label="Label" value={link.label} onChange={(e) => setFooterLink('quick_links', i, 'label', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Path" value={link.path} onChange={(e) => setFooterLink('quick_links', i, 'path', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          ))}
          <TextField size="small" fullWidth sx={{ mb: 1.5, mt: 2 }} label="Other links heading" value={footer.other_links_title || ''} onChange={(e) => setFooterField('other_links_title', e.target.value)} />
          {(footer.other_links || []).map((link, i) => (
            <Stack key={`other-${i}`} direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" label="Label" value={link.label} onChange={(e) => setFooterLink('other_links', i, 'label', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Path" value={link.path} onChange={(e) => setFooterLink('other_links', i, 'path', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          ))}
          <TextField size="small" fullWidth sx={{ mb: 1.5, mt: 2 }} label="Services heading" value={footer.service_links_title || footer.service_list_title || ''} onChange={(e) => setFooterField('service_links_title', e.target.value)} />
          {(footer.service_links || []).map((link, i) => (
            <Stack key={`svc-${i}`} direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" label="Label" value={link.label} onChange={(e) => setFooterLink('service_links', i, 'label', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Path" value={link.path} onChange={(e) => setFooterLink('service_links', i, 'path', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          ))}
          <TextField size="small" fullWidth sx={{ mb: 1.5, mt: 2 }} label="Tools heading" value={footer.tools_links_title || ''} onChange={(e) => setFooterField('tools_links_title', e.target.value)} />
          {(footer.tools_links || []).map((link, i) => (
            <Stack key={`tools-${i}`} direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" label="Label" value={link.label} onChange={(e) => setFooterLink('tools_links', i, 'label', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Path" value={link.path} onChange={(e) => setFooterLink('tools_links', i, 'path', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          ))}
          <TextField size="small" fullWidth sx={{ mb: 1.5, mt: 2 }} label="Legal links heading (optional)" value={footer.legal_links_title || ''} onChange={(e) => setFooterField('legal_links_title', e.target.value)} />
          {(footer.legal_links || []).map((link, i) => (
            <Stack key={`legal-${i}`} direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" label="Label" value={link.label} onChange={(e) => setFooterLink('legal_links', i, 'label', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Path" value={link.path} onChange={(e) => setFooterLink('legal_links', i, 'path', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          ))}
          <TextField size="small" fullWidth sx={{ mb: 1.5, mt: 2 }} label="Newsletter heading" value={footer.newsletter_title || ''} onChange={(e) => setFooterField('newsletter_title', e.target.value)} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Newsletter text" value={footer.newsletter_text || ''} onChange={(e) => setFooterField('newsletter_text', e.target.value)} multiline minRows={2} />
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label="Subscribe button" value={footer.subscribe_button || ''} onChange={(e) => setFooterField('subscribe_button', e.target.value)} sx={{ flex: 1 }} />
            <TextField size="small" label="Copyright (use {year})" value={footer.copyright || ''} onChange={(e) => setFooterField('copyright', e.target.value)} sx={{ flex: 2 }} />
          </Stack>
        </Paper>
        </>
      )}

      {page === 'financing' && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Hero cards</Typography>
            {heroCards.map((card, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Card {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={card.title} onChange={(e) => setHeroCard(i, 'title', e.target.value)} />
                <TextField size="small" fullWidth label="Body" value={card.body} onChange={(e) => setHeroCard(i, 'body', e.target.value)} multiline minRows={3} />
              </Box>
            ))}
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Main content</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Section title" value={financingContent.title as string || ''} onChange={(e) => setFinancingContent('title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Section subtitle" value={financingContent.subtitle as string || ''} onChange={(e) => setFinancingContent('subtitle', e.target.value)} multiline minRows={2} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Steps card title" value={financingContent.steps_title as string || ''} onChange={(e) => setFinancingContent('steps_title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Steps (one per line)" value={featuresToText(financingContent.steps as string[])} onChange={(e) => setFinancingSteps(e.target.value)} multiline minRows={4} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Talk card title" value={financingContent.talk_title as string || ''} onChange={(e) => setFinancingContent('talk_title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Talk card body" value={financingContent.talk_body as string || ''} onChange={(e) => setFinancingContent('talk_body', e.target.value)} multiline minRows={3} />
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField size="small" label="Talk CTA text" value={financingContent.talk_cta_text as string || ''} onChange={(e) => setFinancingContent('talk_cta_text', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Talk CTA link" value={financingContent.talk_cta_link as string || ''} onChange={(e) => setFinancingContent('talk_cta_link', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="PAYG section title" value={financingContent.payg_title as string || ''} onChange={(e) => setFinancingContent('payg_title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="PAYG body" value={financingContent.payg_body as string || ''} onChange={(e) => setFinancingContent('payg_body', e.target.value)} multiline minRows={3} />
            <TextField size="small" fullWidth label="PAYG footer" value={financingContent.payg_footer as string || ''} onChange={(e) => setFinancingContent('payg_footer', e.target.value)} multiline minRows={2} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>Payment calculator</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Calculator title" value={financingContent.payment_calculator_title as string || ''} onChange={(e) => setFinancingContent('payment_calculator_title', e.target.value)} />
            <TextField size="small" fullWidth label="Calculator subtitle" value={financingContent.payment_calculator_subtitle as string || ''} onChange={(e) => setFinancingContent('payment_calculator_subtitle', e.target.value)} multiline minRows={2} />
          </Paper>
        </>
      )}

      {page === 'portfolio' && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
                Gallery items ({portfolioGalleryItems.length})
              </Typography>
              <Button size="small" variant="outlined" onClick={loadBundledPortfolioItems}>
                Load bundled gallery
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Leave empty to use bundled install photos on the public site. Save a full list here to override titles, categories, and metadata.
            </Typography>
            {portfolioGalleryItems.map((item, i) => (
              <Box key={item.id ?? i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Item {i + 1} · ID {item.id}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1, mb: 1 }}>
                  <TextField size="small" label="ID" type="number" value={item.id ?? ''} onChange={(e) => setPortfolioGalleryItem(i, 'id', Number(e.target.value) || 0)} sx={{ maxWidth: 100 }} />
                  <TextField size="small" label="Title" value={item.title || ''} onChange={(e) => setPortfolioGalleryItem(i, 'title', e.target.value)} sx={{ flex: 2 }} />
                  <TextField size="small" label="Category" value={item.category || ''} onChange={(e) => setPortfolioGalleryItem(i, 'category', e.target.value)} sx={{ flex: 1 }} />
                </Stack>
                <TextField size="small" fullWidth sx={{ mb: 1 }} label="Description" value={item.description || ''} onChange={(e) => setPortfolioGalleryItem(i, 'description', e.target.value)} multiline minRows={2} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                  <TextField size="small" label="Location" value={item.location || ''} onChange={(e) => setPortfolioGalleryItem(i, 'location', e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" label="Media type" value={item.media_type || 'image'} onChange={(e) => setPortfolioGalleryItem(i, 'media_type', e.target.value)} sx={{ maxWidth: 140 }} />
                </Stack>
                <CmsImageField label="Image / video URL" value={item.image || ''} onChange={(v) => setPortfolioGalleryItem(i, 'image', v)} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                  <TextField size="small" label="System size" value={item.system_size || ''} onChange={(e) => setPortfolioGalleryItem(i, 'system_size', e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" label="Project type" value={item.project_type || ''} onChange={(e) => setPortfolioGalleryItem(i, 'project_type', e.target.value)} sx={{ flex: 1 }} />
                </Stack>
                <TextField size="small" fullWidth sx={{ mt: 1 }} label="Outcome / savings note" value={item.savings_note || ''} onChange={(e) => setPortfolioGalleryItem(i, 'savings_note', e.target.value)} />
              </Box>
            ))}
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Closing CTA</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={closingCta.title || ''} onChange={(e) => setCtaField('title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Subtitle" value={closingCta.subtitle || ''} onChange={(e) => setCtaField('subtitle', e.target.value)} multiline minRows={2} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField size="small" label="Primary button" value={closingCta.primary_cta_text || ''} onChange={(e) => setCtaField('primary_cta_text', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Primary link" value={closingCta.primary_cta_link || ''} onChange={(e) => setCtaField('primary_cta_link', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          </Paper>
        </>
      )}

      {page === 'packages' && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Packages section</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={packagesSection.title || ''} onChange={(e) => setPackagesSection('title', e.target.value)} />
            <TextField size="small" fullWidth label="Subtitle" value={packagesSection.subtitle || ''} onChange={(e) => setPackagesSection('subtitle', e.target.value)} multiline minRows={2} />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Reading guide</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={readingGuide.title || ''} onChange={(e) => setReadingGuide('title', e.target.value)} />
            <TextField size="small" fullWidth label="Points (one per line)" value={featuresToText(readingGuide.points)} onChange={(e) => setReadingGuide('points_text', e.target.value)} multiline minRows={6} />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Why Energy Precisions</Typography>
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Section title" value={whySection.title || ''} onChange={(e) => setWhySection('title', e.target.value)} />
            {(whySection.features || []).map((f, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Feature {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={f.title} onChange={(e) => setWhyFeature(i, 'title', e.target.value)} />
                <TextField size="small" fullWidth label="Description" value={f.description} onChange={(e) => setWhyFeature(i, 'description', e.target.value)} multiline minRows={2} />
              </Box>
            ))}
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Footer points (one per line)" value={featuresToText(whySection.footer_points)} onChange={(e) => setWhyFooterPoints(e.target.value)} multiline minRows={6} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Warranty note" value={whySection.warranty_note || ''} onChange={(e) => setWhySection('warranty_note', e.target.value)} multiline minRows={2} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Site assessment note" value={whySection.validity_note || ''} onChange={(e) => setWhySection('validity_note', e.target.value)} />
            <TextField size="small" fullWidth label="Contact CTA text" value={whySection.contact_cta_text || ''} onChange={(e) => setWhySection('contact_cta_text', e.target.value)} />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Package tier prices (GHS)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Brochure prices shown on package cards. Leave blank to use bundled defaults from code on deploy sync.
            </Typography>
            <Stack spacing={1.5}>
              {HYBRID_PACKAGES.map((pkg) => (
                <TextField
                  key={pkg.id}
                  size="small"
                  fullWidth
                  type="number"
                  label={`${pkg.kvaLabel} (${pkg.badge})`}
                  value={tierPrices[pkg.id] ?? ''}
                  onChange={(e) => setTierPrice(pkg.id, e.target.value)}
                  inputProps={{ min: 0, step: 100 }}
                />
              ))}
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Package tiers (BOM)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Full tier specs shown on /solar-packages. Deploy sync restores bundled defaults when tiers are cleared.
            </Typography>
            <Stack spacing={2}>
              {packageTiers.map((tier, index) => (
                <Box key={tier.id || index} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {tier.kva_label || tier.id || `Tier ${index + 1}`}
                  </Typography>
                  <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Badge" value={tier.badge || ''} onChange={(e) => setPackageTierField(index, 'badge', e.target.value)} />
                  <TextField size="small" fullWidth sx={{ mb: 1 }} label="KVA label" value={tier.kva_label || ''} onChange={(e) => setPackageTierField(index, 'kva_label', e.target.value)} />
                  <TextField size="small" fullWidth sx={{ mb: 1 }} label="Max watts" value={tier.max_watts || ''} onChange={(e) => setPackageTierField(index, 'max_watts', e.target.value)} />
                  <TextField size="small" fullWidth sx={{ mb: 1 }} label="Customer note" value={tier.customer_note || ''} onChange={(e) => setPackageTierField(index, 'customer_note', e.target.value)} multiline minRows={2} />
                  <TextField size="small" fullWidth sx={{ mb: 1 }} label="Inverter headroom (optional)" value={tier.inverter_headroom || ''} onChange={(e) => setPackageTierField(index, 'inverter_headroom', e.target.value)} />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField size="small" label="Inverter" value={tier.specs?.inverter || ''} onChange={(e) => setPackageTierSpec(index, 'inverter', e.target.value)} sx={{ flex: 1 }} />
                    <TextField size="small" label="Storage" value={tier.specs?.storage || ''} onChange={(e) => setPackageTierSpec(index, 'storage', e.target.value)} sx={{ flex: 1 }} />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField size="small" label="Panels" value={tier.specs?.panels || ''} onChange={(e) => setPackageTierSpec(index, 'panels', e.target.value)} sx={{ flex: 1 }} />
                    <TextField size="small" label="PV array" value={tier.specs?.solar_kw || ''} onChange={(e) => setPackageTierSpec(index, 'solar_kw', e.target.value)} sx={{ flex: 1 }} />
                  </Stack>
                  <TextField size="small" fullWidth sx={{ mb: 1 }} label="Highlights (one per line)" value={featuresToText(tier.highlights)} onChange={(e) => setPackageTierLines(index, 'highlights', e.target.value)} multiline minRows={2} />
                  <TextField size="small" fullWidth sx={{ mb: 1 }} label="Components (one per line)" value={featuresToText(tier.components)} onChange={(e) => setPackageTierLines(index, 'components', e.target.value)} multiline minRows={4} />
                  <TextField size="small" fullWidth label="Typical appliances" value={tier.appliances || ''} onChange={(e) => setPackageTierField(index, 'appliances', e.target.value)} multiline minRows={2} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </>
      )}

      {(page === 'cart' || page === 'checkout' || page === 'checkout_success') && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            {page === 'checkout_success' ? 'Confirmation copy' : 'Empty state'}
          </Typography>
          {page !== 'checkout_success' ? (
            <>
              <TextField
                size="small"
                fullWidth
                sx={{ mb: 1.5 }}
                label="Empty message"
                value={emptyState.title || ''}
                onChange={(e) => setEmptyStateField('title', e.target.value)}
              />
              <TextField
                size="small"
                fullWidth
                label="Empty CTA text"
                value={emptyState.cta_text || ''}
                onChange={(e) => setEmptyStateField('cta_text', e.target.value)}
              />
            </>
          ) : (
            <>
              <TextField
                size="small"
                fullWidth
                sx={{ mb: 1.5 }}
                label="Confirmation body"
                value={(sections.confirmation_body as string) || ''}
                onChange={(e) => setEcommerceField('confirmation_body', e.target.value)}
                multiline
                minRows={2}
              />
              <TextField
                size="small"
                fullWidth
                label="Next steps heading"
                value={(sections.next_steps_title as string) || ''}
                onChange={(e) => setEcommerceField('next_steps_title', e.target.value)}
              />
            </>
          )}
          {page === 'cart' && (
            <TextField
              size="small"
              fullWidth
              sx={{ mt: 1.5 }}
              label="Install note prefix"
              value={(sections.footer_note as string) || ''}
              onChange={(e) => setEcommerceField('footer_note', e.target.value)}
              helperText='Shown before the "Request a site survey" link'
            />
          )}
        </Paper>
      )}

      {(page === 'privacy' || page === 'terms' || page === 'warranty') && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            Legal content sections
          </Typography>
          {((sections.content_sections as LegalContentSection[]) || []).map((sec, i) => (
            <Box key={`${sec.title}-${i}`} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Section {i + 1}
              </Typography>
              <TextField
                size="small"
                fullWidth
                sx={{ mt: 1, mb: 1 }}
                label="Title"
                value={sec.title || ''}
                onChange={(e) => setLegalSection(i, 'title', e.target.value)}
              />
              <TextField
                size="small"
                fullWidth
                label="Body"
                value={sec.body || ''}
                onChange={(e) => setLegalSection(i, 'body', e.target.value)}
                multiline
                minRows={3}
              />
            </Box>
          ))}
        </Paper>
      )}

      {page === 'locations' && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            Location landing pages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Accra, Kumasi, and Tamale pages — routes use each item&apos;s slug (e.g. /solar-accra).
          </Typography>
          {((sections.items as LocationCmsItem[]) || []).map((loc, i) => (
            <Box key={loc.slug || i} sx={{ mb: 2.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {loc.city || `Location ${i + 1}`}
              </Typography>
              <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Slug" value={loc.slug || ''} onChange={(e) => setLocationItem(i, 'slug', e.target.value)} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField size="small" label="City" value={loc.city || ''} onChange={(e) => setLocationItem(i, 'city', e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Region" value={loc.region || ''} onChange={(e) => setLocationItem(i, 'region', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Badge" value={loc.badge || ''} onChange={(e) => setLocationItem(i, 'badge', e.target.value)} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Headline" value={loc.headline || ''} onChange={(e) => setLocationItem(i, 'headline', e.target.value)} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Description" value={loc.description || ''} onChange={(e) => setLocationItem(i, 'description', e.target.value)} multiline minRows={2} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Highlights (one per line)" value={featuresToText(loc.highlights)} onChange={(e) => setLocationItem(i, 'highlights', e.target.value)} multiline minRows={3} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Services (one per line)" value={featuresToText(loc.services)} onChange={(e) => setLocationItem(i, 'services', e.target.value)} multiline minRows={3} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="SEO title" value={loc.seo_title || ''} onChange={(e) => setLocationItem(i, 'seo_title', e.target.value)} />
              <TextField size="small" fullWidth label="SEO description" value={loc.seo_description || ''} onChange={(e) => setLocationItem(i, 'seo_description', e.target.value)} multiline minRows={2} />
            </Box>
          ))}
        </Paper>
      )}

      {page === 'home' && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Credibility section</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Eyebrow" value={credibility.eyebrow || ''} onChange={(e) => setCredibilityField('eyebrow', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Headline" value={credibility.headline || ''} onChange={(e) => setCredibilityField('headline', e.target.value)} multiline minRows={2} />
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Proof points</Typography>
            {(credibility.proofs || []).map((proof, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Proof {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={proof.title} onChange={(e) => setCredibilityProof(i, 'title', e.target.value)} />
                <TextField size="small" fullWidth label="Description" value={proof.description} onChange={(e) => setCredibilityProof(i, 'description', e.target.value)} multiline minRows={2} />
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Why choose us</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={whyChoose.badge || ''} onChange={(e) => setNested('why_choose', 'badge', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={whyChoose.title || ''} onChange={(e) => setNested('why_choose', 'title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Subtitle" value={whyChoose.subtitle || ''} onChange={(e) => setNested('why_choose', 'subtitle', e.target.value)} multiline minRows={2} />
            {(whyChoose.features || []).map((f, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Feature {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={f.title} onChange={(e) => setFeature(i, 'title', e.target.value)} />
                <TextField size="small" fullWidth label="Description" value={f.description} onChange={(e) => setFeature(i, 'description', e.target.value)} multiline minRows={2} />
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Services section header</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={servicesSection.badge || ''} onChange={(e) => setNested('services_section', 'badge', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={servicesSection.title || ''} onChange={(e) => setNested('services_section', 'title', e.target.value)} />
            <TextField size="small" fullWidth label="Subtitle" value={servicesSection.subtitle || ''} onChange={(e) => setNested('services_section', 'subtitle', e.target.value)} multiline minRows={2} />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Service cards (home)</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField size="small" label="View all button" value={serviceCards.view_all_text || ''} onChange={(e) => setSections((s) => ({ ...s, service_cards: { ...(s.service_cards as object), view_all_text: e.target.value } }))} sx={{ flex: 1 }} />
              <TextField size="small" label="View all link" value={serviceCards.view_all_link || ''} onChange={(e) => setSections((s) => ({ ...s, service_cards: { ...(s.service_cards as object), view_all_link: e.target.value } }))} sx={{ flex: 1 }} />
            </Stack>
            {(serviceCards.items || []).map((card, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Card {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={card.title} onChange={(e) => setServiceCard('service_cards', i, 'title', e.target.value)} />
                <TextField size="small" fullWidth sx={{ mb: 1 }} label="Description" value={card.description} onChange={(e) => setServiceCard('service_cards', i, 'description', e.target.value)} multiline minRows={2} />
                <Box sx={{ mb: 1 }}><CmsImageField label="Image" value={card.image} onChange={(v) => setServiceCard('service_cards', i, 'image', v)} /></Box>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField size="small" label="Link" value={card.link} onChange={(e) => setServiceCard('service_cards', i, 'link', e.target.value)} sx={{ flex: 2 }} />
                  <TextField size="small" label="Button" value={card.button_text} onChange={(e) => setServiceCard('service_cards', i, 'button_text', e.target.value)} sx={{ flex: 1 }} />
                </Stack>
                <TextField size="small" fullWidth label="Features (one per line)" value={featuresToText(card.features)} onChange={(e) => setServiceCard('service_cards', i, 'features_text', e.target.value)} multiline minRows={3} />
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Portfolio teaser</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={portfolio.badge || ''} onChange={(e) => setNested('portfolio', 'badge', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={portfolio.title || ''} onChange={(e) => setNested('portfolio', 'title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Subtitle" value={portfolio.subtitle || ''} onChange={(e) => setNested('portfolio', 'subtitle', e.target.value)} multiline minRows={2} />
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField size="small" label="CTA button" value={portfolio.cta_text || ''} onChange={(e) => setNested('portfolio', 'cta_text', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="CTA link" value={portfolio.cta_link || ''} onChange={(e) => setNested('portfolio', 'cta_link', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
            {(portfolio.items || []).map((item, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Project {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={item.title} onChange={(e) => setPortfolioItem(i, 'title', e.target.value)} />
                <Box sx={{ mb: 1 }}><CmsImageField label="Image" value={item.image} onChange={(v) => setPortfolioItem(i, 'image', v)} /></Box>
                <TextField size="small" fullWidth label="Alt text" value={item.alt} onChange={(e) => setPortfolioItem(i, 'alt', e.target.value)} />
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Installation process</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={processSection.badge || ''} onChange={(e) => setNested('process', 'badge', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Title" value={processSection.title || ''} onChange={(e) => setNested('process', 'title', e.target.value)} />
            {(processSection.steps || []).map((step, i) => (
              <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Stack direction="row" spacing={1}>
                  <TextField size="small" label="Step" value={step.step} onChange={(e) => setProcessStep(i, 'step', e.target.value)} sx={{ width: 80 }} />
                  <TextField size="small" label="Title" value={step.title} onChange={(e) => setProcessStep(i, 'title', e.target.value)} sx={{ flex: 1 }} />
                </Stack>
                <TextField size="small" fullWidth sx={{ mt: 1 }} label="Description" value={step.desc} onChange={(e) => setProcessStep(i, 'desc', e.target.value)} />
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Testimonials</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={testimonials.badge || ''} onChange={(e) => setNested('testimonials', 'badge', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Title" value={testimonials.title || ''} onChange={(e) => setNested('testimonials', 'title', e.target.value)} />
            {(testimonials.items || []).map((t, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Testimonial {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Name" value={t.name} onChange={(e) => setTestimonial(i, 'name', e.target.value)} />
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField size="small" label="Role" value={t.role} onChange={(e) => setTestimonial(i, 'role', e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" label="Location" value={t.location} onChange={(e) => setTestimonial(i, 'location', e.target.value)} sx={{ flex: 1 }} />
                </Stack>
                <TextField size="small" fullWidth label="Quote" value={t.text} onChange={(e) => setTestimonial(i, 'text', e.target.value)} multiline minRows={3} />
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Closing CTA</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={closingCta.title || ''} onChange={(e) => setCtaField('title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Subtitle" value={closingCta.subtitle || ''} onChange={(e) => setCtaField('subtitle', e.target.value)} multiline minRows={2} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" label="Primary button" value={closingCta.primary_cta_text || ''} onChange={(e) => setCtaField('primary_cta_text', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Primary link" value={closingCta.primary_cta_link || ''} onChange={(e) => setCtaField('primary_cta_link', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField size="small" label="Secondary button" value={closingCta.secondary_cta_text || ''} onChange={(e) => setCtaField('secondary_cta_text', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Secondary link" value={closingCta.secondary_cta_link || ''} onChange={(e) => setCtaField('secondary_cta_link', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          </Paper>
        </>
      )}

      {page === 'about' && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Mission & vision</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Mission title" value={missionVision.mission_title || ''} onChange={(e) => setMissionVision('mission_title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Mission text" value={missionVision.mission_text || ''} onChange={(e) => setMissionVision('mission_text', e.target.value)} multiline minRows={3} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Vision title" value={missionVision.vision_title || ''} onChange={(e) => setMissionVision('vision_title', e.target.value)} />
            <TextField size="small" fullWidth label="Vision text" value={missionVision.vision_text || ''} onChange={(e) => setMissionVision('vision_text', e.target.value)} multiline minRows={3} />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Why choose us (About)</Typography>
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Section title" value={aboutWhyChoose.title || ''} onChange={(e) => setNested('why_choose', 'title', e.target.value)} />
            {(aboutWhyChoose.features || []).map((f, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Feature {i + 1}</Typography>
                <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={f.title} onChange={(e) => setFeature(i, 'title', e.target.value)} />
                <TextField size="small" fullWidth label="Description" value={f.description} onChange={(e) => setFeature(i, 'description', e.target.value)} multiline minRows={2} />
              </Box>
            ))}
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Values / specialties</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={specialties.badge || ''} onChange={(e) => setNested('specialties', 'badge', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={specialties.title || ''} onChange={(e) => setNested('specialties', 'title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Subtitle" value={specialties.subtitle || ''} onChange={(e) => setNested('specialties', 'subtitle', e.target.value)} multiline minRows={2} />
            {(specialties.items || []).map((item, i) => (
              <TextField key={i} size="small" fullWidth sx={{ mb: 1 }} label={`Value ${i + 1}`} value={item} onChange={(e) => setSpecialty(i, e.target.value)} />
            ))}
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Impact stats</Typography>
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Section title" value={impactStats.title || ''} onChange={(e) => setSections((s) => ({ ...s, impact_stats: { ...(s.impact_stats as object), title: e.target.value } }))} />
            {(impactStats.items || []).map((stat, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Stat {i + 1}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                  <TextField size="small" label="Value" value={stat.value} onChange={(e) => setImpactStat(i, 'value', e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" label="Label" value={stat.label} onChange={(e) => setImpactStat(i, 'label', e.target.value)} sx={{ flex: 2 }} />
                </Stack>
                <TextField size="small" fullWidth label="Description" value={stat.description} onChange={(e) => setImpactStat(i, 'description', e.target.value)} multiline minRows={2} />
              </Box>
            ))}
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Visit us</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={visitUs.badge || ''} onChange={(e) => setVisitUs('badge', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={visitUs.title || ''} onChange={(e) => setVisitUs('title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Subtitle" value={visitUs.subtitle || ''} onChange={(e) => setVisitUs('subtitle', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Location heading" value={visitUs.location_title || ''} onChange={(e) => setVisitUs('location_title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Address" value={visitUs.location_address || ''} onChange={(e) => setVisitUs('location_address', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="Location description" value={visitUs.location_body || ''} onChange={(e) => setVisitUs('location_body', e.target.value)} multiline minRows={3} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="CTA card title" value={visitUs.cta_title || ''} onChange={(e) => setVisitUs('cta_title', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 2 }} label="CTA card body" value={visitUs.cta_body || ''} onChange={(e) => setVisitUs('cta_body', e.target.value)} multiline minRows={3} />
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="Phone" value={visitUs.phone || ''} onChange={(e) => setVisitUs('phone', e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Email" value={visitUs.email || ''} onChange={(e) => setVisitUs('email', e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          </Paper>
        </>
      )}

      {page === 'services' && (
        <>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Service cards</Typography>
          {(serviceCards.items || []).map((card, i) => (
            <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Service {i + 1}</Typography>
              <TextField size="small" fullWidth sx={{ mt: 1, mb: 1 }} label="Title" value={card.title} onChange={(e) => setServiceCard('service_cards', i, 'title', e.target.value)} />
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Description" value={card.description} onChange={(e) => setServiceCard('service_cards', i, 'description', e.target.value)} multiline minRows={2} />
              <Box sx={{ mb: 1 }}><CmsImageField label="Image" value={card.image} onChange={(v) => setServiceCard('service_cards', i, 'image', v)} /></Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField size="small" label="Link" value={card.link} onChange={(e) => setServiceCard('service_cards', i, 'link', e.target.value)} sx={{ flex: 2 }} />
                <TextField size="small" label="Button" value={card.button_text} onChange={(e) => setServiceCard('service_cards', i, 'button_text', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
              <TextField size="small" fullWidth label="Features (one per line)" value={featuresToText(card.features)} onChange={(e) => setServiceCard('service_cards', i, 'features_text', e.target.value)} multiline minRows={4} />
            </Box>
          ))}
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Installation process</Typography>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={processSection.badge || ''} onChange={(e) => setNested('process', 'badge', e.target.value)} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={processSection.title || ''} onChange={(e) => setNested('process', 'title', e.target.value)} />
          <TextField size="small" fullWidth sx={{ mb: 2 }} label="Subtitle" value={processSection.subtitle || ''} onChange={(e) => setNested('process', 'subtitle', e.target.value)} multiline minRows={2} />
          {(processSection.steps || []).map((step, i) => (
            <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Stack direction="row" spacing={1}>
                <TextField size="small" label="Step" value={step.step} onChange={(e) => setProcessStep(i, 'step', e.target.value)} sx={{ width: 80 }} />
                <TextField size="small" label="Title" value={step.title} onChange={(e) => setProcessStep(i, 'title', e.target.value)} sx={{ flex: 1 }} />
              </Stack>
              <TextField size="small" fullWidth sx={{ mt: 1 }} label="Description" value={step.desc} onChange={(e) => setProcessStep(i, 'desc', e.target.value)} multiline minRows={2} />
            </Box>
          ))}
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Guarantees</Typography>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Badge" value={guarantees.badge || ''} onChange={(e) => setNested('guarantees', 'badge', e.target.value)} />
          <TextField size="small" fullWidth sx={{ mb: 2 }} label="Title" value={guarantees.title || ''} onChange={(e) => setNested('guarantees', 'title', e.target.value)} />
          {(guarantees.items || []).map((g, i) => (
            <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <TextField size="small" fullWidth sx={{ mb: 1 }} label="Title" value={g.title} onChange={(e) => setGuarantee(i, 'title', e.target.value)} />
              <TextField size="small" fullWidth label="Description" value={g.desc} onChange={(e) => setGuarantee(i, 'desc', e.target.value)} multiline minRows={2} />
            </Box>
          ))}
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Closing CTA</Typography>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Title" value={servicesClosingCta.title || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), title: e.target.value } }))} />
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Subtitle" value={servicesClosingCta.subtitle || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), subtitle: e.target.value } }))} multiline minRows={2} />
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField size="small" label="Primary button" value={servicesClosingCta.primary_cta_text || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), primary_cta_text: e.target.value } }))} sx={{ flex: 1 }} />
            <TextField size="small" label="Primary link" value={servicesClosingCta.primary_cta_link || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), primary_cta_link: e.target.value } }))} sx={{ flex: 1 }} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField size="small" label="Link 1 text" value={servicesClosingCta.link1_text || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), link1_text: e.target.value } }))} sx={{ flex: 1 }} />
            <TextField size="small" label="Link 1 URL" value={servicesClosingCta.link1_url || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), link1_url: e.target.value } }))} sx={{ flex: 1 }} />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <TextField size="small" label="Link 2 text" value={servicesClosingCta.link2_text || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), link2_text: e.target.value } }))} sx={{ flex: 1 }} />
            <TextField size="small" label="Link 2 URL" value={servicesClosingCta.link2_url || ''} onChange={(e) => setSections((s) => ({ ...s, closing_cta: { ...(s.closing_cta as object), link2_url: e.target.value } }))} sx={{ flex: 1 }} />
          </Stack>
        </Paper>
        </>
      )}

      {page === 'contact' && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Sidebar labels</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Phone card label" value={contactSidebar.phone_label || ''} onChange={(e) => setContactBlock('sidebar', 'phone_label', e.target.value)} />
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Email card label" value={contactSidebar.email_label || ''} onChange={(e) => setContactBlock('sidebar', 'email_label', e.target.value)} />
            <TextField size="small" fullWidth label="Location card label" value={contactSidebar.location_label || ''} onChange={(e) => setContactBlock('sidebar', 'location_label', e.target.value)} />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Contact form</Typography>
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Submit button text" value={contactForm.submit_text || ''} onChange={(e) => setContactBlock('form', 'submit_text', e.target.value)} />
            <TextField size="small" fullWidth label="Success message" value={contactForm.success_message || ''} onChange={(e) => setContactBlock('form', 'success_message', e.target.value)} multiline minRows={2} />
          </Paper>
        </>
      )}

      {page !== 'global' && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>SEO</Typography>
          <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Meta title" value={seo.title || ''} onChange={(e) => setSeoField('title', e.target.value)} />
          {page === 'contact' && (
            <TextField size="small" fullWidth sx={{ mb: 1.5 }} label="Quote request meta title" value={seo.quote_title || ''} onChange={(e) => setSeoField('quote_title', e.target.value)} />
          )}
          <TextField size="small" fullWidth label="Meta description" value={seo.description || ''} onChange={(e) => setSeoField('description', e.target.value)} multiline minRows={2} />
        </Paper>
      )}
    </Box>
  );
};

export default CmsPageEditor;

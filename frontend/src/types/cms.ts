export interface CmsStat {
  value: string;
  label: string;
}

export interface CmsHeroSlide {
  badge: string;
  headline: string;
  headline_highlight: string;
  description: string;
  hero_image: string;
  image_overlay: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
}

export interface CmsHeroSliderSettings {
  autoplay_seconds: number;
}

export interface CmsHero {
  badge: string;
  headline: string;
  headline_highlight: string;
  description: string;
  hero_image: string;
  image_overlay: string;
  pillars: string[];
  stats: CmsStat[];
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  link1_text: string;
  link1_url: string;
  link2_text: string;
  link2_url: string;
  slides?: CmsHeroSlide[];
  slider?: CmsHeroSliderSettings;
}

export interface CmsSectionHeader {
  badge: string;
  title: string;
  subtitle: string;
}

export interface CmsFeature {
  title: string;
  description: string;
}

export interface CmsTestimonial {
  name: string;
  location: string;
  role: string;
  text: string;
  rating: number;
}

export interface CmsCta {
  title: string;
  subtitle: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
}

export interface CmsServiceCard {
  title: string;
  description: string;
  features: string[];
  image: string;
  link: string;
  button_text: string;
}

export interface CmsPortfolioItem {
  title: string;
  image: string;
  alt: string;
  link: string;
}

export interface CmsProcessStep {
  step: string;
  title: string;
  desc: string;
}

export interface CmsImpactStat {
  value: string;
  label: string;
  description: string;
}

export interface ShopHero {
  badge: string;
  headline: string;
  description: string;
}

export interface CmsSeo {
  title: string;
  description: string;
  quote_title?: string;
}

export interface CmsLink {
  label: string;
  path: string;
}

export interface CmsSimpleHero {
  badge: string;
  headline: string;
  description: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
}

export interface CmsTextCard {
  title: string;
  body: string;
}

export interface CmsFooter {
  company_name: string;
  tagline: string;
  quick_links_title: string;
  quick_links: CmsLink[];
  other_links_title: string;
  other_links: CmsLink[];
  service_list_title: string;
  service_list: string[];
  newsletter_title: string;
  newsletter_text: string;
  subscribe_button: string;
  copyright: string;
}

export interface GlobalPageSections {
  footer: CmsFooter;
}

export interface FinancingPageSections {
  seo: CmsSeo;
  hero: CmsSimpleHero;
  hero_cards: CmsTextCard[];
  content: {
    title: string;
    subtitle: string;
    steps_title: string;
    steps: string[];
    talk_title: string;
    talk_body: string;
    talk_cta_text: string;
    talk_cta_link: string;
    payg_title: string;
    payg_body: string;
    payg_footer: string;
  };
}

export interface PackagesPageSections {
  seo: CmsSeo;
  hero: CmsSimpleHero;
  packages_section: { title: string; subtitle: string };
  reading_guide: { title: string; points: string[] };
  why_section: {
    title: string;
    features: CmsFeature[];
    footer_points: string[];
    warranty_note: string;
    validity_note: string;
    contact_cta_text: string;
  };
}

export interface CmsCredibilityProof {
  title: string;
  description: string;
}

export interface CmsCredibility {
  eyebrow: string;
  headline: string;
  proofs: CmsCredibilityProof[];
}

export interface HomePageSections {
  seo?: CmsSeo;
  hero: CmsHero;
  /** @deprecated use credibility */
  trust_bar?: { items: { text: string }[] };
  credibility: CmsCredibility;
  why_choose: CmsSectionHeader & { features: CmsFeature[] };
  services_section: CmsSectionHeader;
  service_cards: {
    items: CmsServiceCard[];
    view_all_text: string;
    view_all_link: string;
  };
  portfolio: CmsSectionHeader & {
    items: CmsPortfolioItem[];
    cta_text: string;
    cta_link: string;
  };
  process: CmsSectionHeader & { steps: CmsProcessStep[] };
  testimonials: CmsSectionHeader & { items: CmsTestimonial[] };
  closing_cta: CmsCta;
}

export interface CmsGuaranteeItem {
  title: string;
  desc: string;
}

export interface CmsExtendedCta extends CmsCta {
  link1_text?: string;
  link1_url?: string;
  link2_text?: string;
  link2_url?: string;
}

export interface CmsMissionVision {
  mission_title: string;
  mission_text: string;
  vision_title: string;
  vision_text: string;
}

export interface CmsVisitUs {
  badge: string;
  title: string;
  subtitle: string;
  location_title: string;
  location_address: string;
  location_body: string;
  cta_title: string;
  cta_body: string;
  phone: string;
  email: string;
}

export interface ContactPageSections {
  seo?: CmsSeo;
  hero: {
    title: string;
    quote_title: string;
    subtitle: string;
  };
  sidebar: {
    phone_label: string;
    email_label: string;
    location_label: string;
  };
  form: {
    submit_text: string;
    success_message: string;
  };
}

export interface AboutPageSections {
  seo?: CmsSeo;
  hero: CmsHero;
  mission_vision: CmsMissionVision;
  why_choose: CmsSectionHeader & { features: CmsFeature[] };
  specialties: CmsSectionHeader & { items: string[] };
  impact_stats: { title: string; items: CmsImpactStat[] };
  visit_us: CmsVisitUs;
}

export interface ServicesPageSections {
  seo?: CmsSeo;
  hero: CmsHero;
  service_cards: { items: CmsServiceCard[] };
  process: CmsSectionHeader & { steps: CmsProcessStep[] };
  guarantees: CmsSectionHeader & { items: CmsGuaranteeItem[] };
  closing_cta: CmsExtendedCta;
}

export interface ShopPageSections {
  seo?: CmsSeo;
  hero: ShopHero;
}

export type CmsPageSlug =
  | 'home'
  | 'about'
  | 'services'
  | 'shop'
  | 'contact'
  | 'global'
  | 'packages'
  | 'financing';

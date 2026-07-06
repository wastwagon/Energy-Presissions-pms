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

/** Full gallery entry for /portfolio CMS page */
export interface CmsPortfolioGalleryItem {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  location: string;
  media_type?: 'image' | 'video';
  system_size?: string;
  project_type?: string;
  savings_note?: string;
  published?: boolean;
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

export interface CmsHeaderNavItem {
  label: string;
  path: string;
  submenu?: CmsLink[];
}

export interface CmsHeader {
  menu_items: CmsHeaderNavItem[];
}

export interface CmsFooter {
  company_name: string;
  tagline: string;
  quick_links_title: string;
  quick_links: CmsLink[];
  other_links_title: string;
  other_links: CmsLink[];
  /** @deprecated use service_links */
  service_list_title?: string;
  /** @deprecated use service_links */
  service_list?: string[];
  service_links_title?: string;
  service_links?: CmsLink[];
  tools_links_title?: string;
  tools_links?: CmsLink[];
  legal_links?: CmsLink[];
  legal_links_title?: string;
  newsletter_title: string;
  newsletter_text: string;
  subscribe_button: string;
  copyright: string;
}

export interface CmsGoogleReviews {
  /** Google Maps star rating (1–5). 0 or empty = use on-site testimonials average */
  rating: number;
  review_count: number;
  /** Optional Google Place ID for embed + write-review links */
  place_id?: string;
}

/** Site-wide contact — editable under global CMS (Phase 1) */
export interface CmsSiteContact {
  name: string;
  tagline: string;
  logo_src: string;
  logo_alt: string;
  website: string;
  website_display: string;
  phone: string;
  phone_display: string;
  whatsapp: string;
  whatsapp_display: string;
  email_primary: string;
  email_sales: string;
  address_line1: string;
  address_line2: string;
  address_full: string;
  office_heading: string;
  office_region_note: string;
  google_maps_review_url: string;
  google_maps_write_review_url: string;
  google_maps_embed_url: string;
}

export interface CmsSocialLinks {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

export interface CmsSiteCta {
  consultation: string;
  quote: string;
  quote_href: string;
  survey_href: string;
}

/** Canonical site-wide impact figures — edit once under global CMS */
export interface CmsGlobalImpactStats {
  title: string;
  items: CmsImpactStat[];
}

/** Short hero stat strip (value + label) */
export interface CmsGlobalHeroStats {
  items: CmsStat[];
}

/** Marketing-safe warranty messaging aligned with /warranty legal page */
export interface CmsWarrantySummary {
  headline: string;
  workmanship: string;
  equipment: string;
  shop_note: string;
  details_path: string;
}

export interface GlobalPageSections {
  contact?: CmsSiteContact;
  social?: CmsSocialLinks;
  cta?: CmsSiteCta;
  hero_stats?: CmsGlobalHeroStats;
  impact_stats?: CmsGlobalImpactStats;
  warranty_summary?: CmsWarrantySummary;
  header: CmsHeader;
  footer: CmsFooter;
  google_reviews?: CmsGoogleReviews;
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
    payment_calculator_title?: string;
    payment_calculator_subtitle?: string;
  };
}

export interface PortfolioPageSections {
  seo: CmsSeo;
  hero: ShopHero;
  items: CmsPortfolioGalleryItem[];
  closing_cta: CmsCta;
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
  /** Optional GHS price overrides keyed by package id (e.g. ep-8kva) */
  tier_prices?: Record<string, number>;
}

/** Hero + SEO for marketing pages (blog, reviews, referral) */
export interface MarketingPageSections {
  seo?: CmsSeo;
  hero: ShopHero;
}

export interface LegalContentSection {
  title: string;
  body: string;
}

export interface LegalPageSections {
  seo?: CmsSeo;
  hero: ShopHero;
  content_sections: LegalContentSection[];
}

export interface LocationCmsItem {
  slug: string;
  city: string;
  region: string;
  badge: string;
  headline: string;
  description: string;
  highlights: string[];
  services: string[];
  seo_title: string;
  seo_description: string;
}

export interface LocationsPageSections {
  items: LocationCmsItem[];
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
  | 'financing'
  | 'portfolio'
  | 'blog'
  | 'reviews'
  | 'referral'
  | 'privacy'
  | 'terms'
  | 'warranty'
  | 'locations'
  | 'faqs'
  | 'solar_estimate'
  | 'load_calculator';

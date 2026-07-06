import type {
  CmsGlobalHeroStats,
  CmsGlobalImpactStats,
  CmsSiteContact,
  CmsSiteCta,
  CmsSocialLinks,
  CmsStat,
  CmsWarrantySummary,
} from '../types/cms';

/** Bundled defaults for global site settings (contact, social, CTA). */
export const DEFAULT_CMS_CONTACT: CmsSiteContact = {
  name: 'Energy Precisions',
  tagline: 'Seamless solar installation service you can trust',
  logo_src: '/website_images/Logo1-1-scaled-e1752479241874.png',
  logo_alt: 'Energy Precisions logo',
  website: 'https://energyprecisions.com',
  website_display: 'www.energyprecisions.com',
  phone: '+233533611611',
  phone_display: '(+233) 533 611 611',
  whatsapp: '233533611611',
  whatsapp_display: 'Chat on WhatsApp',
  email_primary: 'info@energyprecisions.com',
  email_sales: 'info@energyprecisions.com',
  address_line1: 'Haatso, Ecomog',
  address_line2: 'Accra, Ghana',
  address_full: 'Haatso, Ecomog, Accra, Ghana',
  office_heading: 'Accra office',
  office_region_note:
    'We operate from our Accra office. Site surveys and installations are arranged across Greater Accra and other regions by appointment.',
  google_maps_review_url:
    'https://www.google.com/maps/search/?api=1&query=Energy+Precisions+Haatso+Ecomog+Accra+Ghana',
  google_maps_write_review_url:
    'https://www.google.com/maps/search/?api=1&query=Energy+Precisions+Haatso+Ecomog+Accra+Ghana',
  google_maps_embed_url:
    'https://maps.google.com/maps?q=Energy+Precisions+Haatso+Ecomog+Accra+Ghana&hl=en&z=15&output=embed',
};

export const DEFAULT_CMS_SOCIAL: CmsSocialLinks = {
  facebook: 'https://www.facebook.com/energyprecisions',
  twitter: 'https://twitter.com/energyprecisions',
  linkedin: 'https://www.linkedin.com/company/energyprecisions',
  instagram: 'https://www.instagram.com/energyprecisions',
};

export const DEFAULT_CMS_CTA: CmsSiteCta = {
  consultation: 'Get free consultation',
  quote: 'Get free consultation',
  quote_href: '/contact?action=quote',
  survey_href: '/contact?action=quote&topic=package',
};

/** Realistic, verifiable capability stats — not inflated vanity metrics */
export const DEFAULT_CMS_HERO_STATS: CmsGlobalHeroStats = {
  items: [
    { value: '6.5–20 kVA', label: 'Hybrid package range' },
    { value: '16 kWh', label: 'LiFePO₄ storage modules' },
    { value: 'Accra HQ', label: 'Ghana-wide installs' },
  ],
};

export const DEFAULT_CMS_IMPACT_STATS: CmsGlobalImpactStats = {
  title: 'What we deliver',
  items: [
    {
      value: '6',
      label: 'Package tiers',
      description:
        'Published hybrid tiers from 6.5 kVA essential homes through 20 kVA light commercial — each with defined load ceilings.',
    },
    {
      value: '16 kWh',
      label: 'LiFePO₄ modules',
      description:
        'Stocked lithium battery blocks used across our hybrid package line; module count confirmed on site survey.',
    },
    {
      value: '1',
      label: 'Accra office',
      description:
        'Haatso, Ecomog headquarters — engineering, quotes, and install scheduling for projects across Ghana.',
    },
  ],
};

export const DEFAULT_CMS_WARRANTY_SUMMARY: CmsWarrantySummary = {
  headline: 'Documented warranty coverage',
  workmanship:
    'Installation workmanship terms are confirmed in your project quotation — typically 2 years on hybrid package installs.',
  equipment:
    'Panels, inverters, and lithium batteries carry manufacturer warranties (commonly 5–25 years depending on model). Final coverage is listed on your invoice.',
  shop_note:
    'Shop purchases without installation include manufacturer warranty only; extended workmanship requires a signed install agreement.',
  details_path: '/warranty',
};

export function heroStatsFromImpact(impact: CmsGlobalImpactStats): CmsStat[] {
  return impact.items.slice(0, 3).map((item) => ({
    value: item.value,
    label: item.label,
  }));
}

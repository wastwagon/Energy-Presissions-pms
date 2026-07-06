import {
  DEFAULT_CMS_CONTACT,
  DEFAULT_CMS_CTA,
  DEFAULT_CMS_HERO_STATS,
  DEFAULT_CMS_IMPACT_STATS,
  DEFAULT_CMS_SOCIAL,
  DEFAULT_CMS_WARRANTY_SUMMARY,
  heroStatsFromImpact,
} from '../data/siteConfigDefaults';
import type {
  CmsGlobalHeroStats,
  CmsGlobalImpactStats,
  CmsSiteContact,
  CmsSiteCta,
  CmsSocialLinks,
  CmsStat,
  CmsWarrantySummary,
  GlobalPageSections,
} from '../types/cms';

/** Runtime contact shape used across public components */
export interface SiteContact {
  name: string;
  tagline: string;
  logoSrc: string;
  logoAlt: string;
  website: string;
  websiteDisplay: string;
  phone: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  whatsappDisplay: string;
  googlePlaceId: string;
  googleMapsReviewUrl: string;
  googleMapsWriteReviewUrl: string;
  googleMapsEmbedUrl: string;
  emailPrimary: string;
  emailSales: string;
  addressLine1: string;
  addressLine2: string;
  addressFull: string;
  officeHeading: string;
  officeRegionNote: string;
}

export interface SiteSocialLinks {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

export interface SiteCta {
  consultation: string;
  quote: string;
  quoteHref: string;
  surveyHref: string;
}

export type SiteImpactStats = CmsGlobalImpactStats;
export type SiteWarrantySummary = CmsWarrantySummary;

function pickString(value: string | undefined | null, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function phoneHrefFrom(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, '');
  return normalized ? `tel:${normalized}` : 'tel:';
}

function whatsappHrefFrom(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : 'https://wa.me/';
}

function mergeCmsContact(
  cms?: Partial<CmsSiteContact>,
  placeId?: string,
): SiteContact {
  const c = { ...DEFAULT_CMS_CONTACT, ...cms };
  const phone = pickString(c.phone, DEFAULT_CMS_CONTACT.phone);
  const whatsapp = pickString(c.whatsapp, DEFAULT_CMS_CONTACT.whatsapp);
  return {
    name: pickString(c.name, DEFAULT_CMS_CONTACT.name),
    tagline: pickString(c.tagline, DEFAULT_CMS_CONTACT.tagline),
    logoSrc: pickString(c.logo_src, DEFAULT_CMS_CONTACT.logo_src),
    logoAlt: pickString(c.logo_alt, DEFAULT_CMS_CONTACT.logo_alt),
    website: pickString(c.website, DEFAULT_CMS_CONTACT.website),
    websiteDisplay: pickString(c.website_display, DEFAULT_CMS_CONTACT.website_display),
    phone,
    phoneDisplay: pickString(c.phone_display, DEFAULT_CMS_CONTACT.phone_display),
    phoneHref: phoneHrefFrom(phone),
    whatsapp,
    whatsappHref: whatsappHrefFrom(whatsapp),
    whatsappDisplay: pickString(c.whatsapp_display, DEFAULT_CMS_CONTACT.whatsapp_display),
    googlePlaceId: placeId?.trim() || '',
    googleMapsReviewUrl: pickString(
      c.google_maps_review_url,
      DEFAULT_CMS_CONTACT.google_maps_review_url,
    ),
    googleMapsWriteReviewUrl: pickString(
      c.google_maps_write_review_url,
      DEFAULT_CMS_CONTACT.google_maps_write_review_url,
    ),
    googleMapsEmbedUrl: pickString(
      c.google_maps_embed_url,
      DEFAULT_CMS_CONTACT.google_maps_embed_url,
    ),
    emailPrimary: pickString(c.email_primary, DEFAULT_CMS_CONTACT.email_primary),
    emailSales: pickString(c.email_sales, DEFAULT_CMS_CONTACT.email_sales),
    addressLine1: pickString(c.address_line1, DEFAULT_CMS_CONTACT.address_line1),
    addressLine2: pickString(c.address_line2, DEFAULT_CMS_CONTACT.address_line2),
    addressFull: pickString(c.address_full, DEFAULT_CMS_CONTACT.address_full),
    officeHeading: pickString(c.office_heading, DEFAULT_CMS_CONTACT.office_heading),
    officeRegionNote: pickString(c.office_region_note, DEFAULT_CMS_CONTACT.office_region_note),
  };
}

function mergeCmsSocial(cms?: Partial<CmsSocialLinks>): SiteSocialLinks {
  const s = { ...DEFAULT_CMS_SOCIAL, ...cms };
  return {
    facebook: pickString(s.facebook, DEFAULT_CMS_SOCIAL.facebook),
    twitter: pickString(s.twitter, DEFAULT_CMS_SOCIAL.twitter),
    linkedin: pickString(s.linkedin, DEFAULT_CMS_SOCIAL.linkedin),
    instagram: pickString(s.instagram, DEFAULT_CMS_SOCIAL.instagram),
  };
}

function mergeCmsCta(cms?: Partial<CmsSiteCta>): SiteCta {
  const t = { ...DEFAULT_CMS_CTA, ...cms };
  return {
    consultation: pickString(t.consultation, DEFAULT_CMS_CTA.consultation),
    quote: pickString(t.quote, DEFAULT_CMS_CTA.quote),
    quoteHref: pickString(t.quote_href, DEFAULT_CMS_CTA.quote_href),
    surveyHref: pickString(t.survey_href, DEFAULT_CMS_CTA.survey_href),
  };
}

function mergeImpactStats(cms?: Partial<CmsGlobalImpactStats>): CmsGlobalImpactStats {
  const base = DEFAULT_CMS_IMPACT_STATS;
  if (!cms?.items?.length) {
    return {
      title: pickString(cms?.title, base.title),
      items: base.items,
    };
  }
  return {
    title: pickString(cms.title, base.title),
    items: cms.items.map((item, i) => {
      const fallback = base.items[i] || base.items[0];
      return {
        value: pickString(item.value, fallback.value),
        label: pickString(item.label, fallback.label),
        description: pickString(item.description, fallback.description),
      };
    }),
  };
}

function mergeWarrantySummary(cms?: Partial<CmsWarrantySummary>): CmsWarrantySummary {
  const w = { ...DEFAULT_CMS_WARRANTY_SUMMARY, ...cms };
  return {
    headline: pickString(w.headline, DEFAULT_CMS_WARRANTY_SUMMARY.headline),
    workmanship: pickString(w.workmanship, DEFAULT_CMS_WARRANTY_SUMMARY.workmanship),
    equipment: pickString(w.equipment, DEFAULT_CMS_WARRANTY_SUMMARY.equipment),
    shop_note: pickString(w.shop_note, DEFAULT_CMS_WARRANTY_SUMMARY.shop_note),
    details_path: pickString(w.details_path, DEFAULT_CMS_WARRANTY_SUMMARY.details_path),
  };
}

function mergeHeroStats(
  cmsHero?: Partial<CmsGlobalHeroStats>,
  impact?: CmsGlobalImpactStats,
): CmsStat[] {
  if (cmsHero?.items?.length) {
    return cmsHero.items.map((item, i) => {
      const fallback = DEFAULT_CMS_HERO_STATS.items[i] || DEFAULT_CMS_HERO_STATS.items[0];
      return {
        value: pickString(item.value, fallback.value),
        label: pickString(item.label, fallback.label),
      };
    });
  }
  if (impact?.items?.length) {
    return heroStatsFromImpact(impact);
  }
  return DEFAULT_CMS_HERO_STATS.items;
}

export function resolveSiteConfig(global?: Partial<GlobalPageSections>): {
  contact: SiteContact;
  social: SiteSocialLinks;
  cta: SiteCta;
  heroStats: CmsStat[];
  impactStats: CmsGlobalImpactStats;
  warrantySummary: CmsWarrantySummary;
} {
  const placeId = global?.google_reviews?.place_id;
  const impactStats = mergeImpactStats(global?.impact_stats);
  return {
    contact: mergeCmsContact(global?.contact, placeId),
    social: mergeCmsSocial(global?.social),
    cta: mergeCmsCta(global?.cta),
    impactStats,
    heroStats: mergeHeroStats(global?.hero_stats, impactStats),
    warrantySummary: mergeWarrantySummary(global?.warranty_summary),
  };
}

export function resolveSiteContact(global?: Partial<GlobalPageSections>): SiteContact {
  return resolveSiteConfig(global).contact;
}

export function resolveSiteSocial(global?: Partial<GlobalPageSections>): SiteSocialLinks {
  return resolveSiteConfig(global).social;
}

export function resolveSiteCta(global?: Partial<GlobalPageSections>): SiteCta {
  return resolveSiteConfig(global).cta;
}

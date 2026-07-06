import type { CmsLink } from '../types/cms';

/** Fallback footer links when CMS global footer is missing fields */
export const DEFAULT_FOOTER_SERVICE_LINKS: CmsLink[] = [
  { label: 'All services', path: '/services' },
  { label: 'Residential solar', path: '/services#residential' },
  { label: 'Commercial solar', path: '/services#commercial' },
  { label: 'Industrial solar', path: '/services#industrial' },
  { label: 'Battery storage', path: '/services#battery' },
  { label: 'Agricultural solar', path: '/services#agricultural' },
  { label: 'Maintenance', path: '/services' },
];

export const DEFAULT_FOOTER_TOOLS_LINKS: CmsLink[] = [
  { label: 'Solar size estimator', path: '/solar-estimate' },
  { label: 'Load calculator', path: '/load-calculator' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Hybrid packages', path: '/solar-packages' },
  { label: 'Warranty', path: '/warranty' },
];

export const DEFAULT_FOOTER_LEGAL_LINKS: CmsLink[] = [
  { label: 'Privacy policy', path: '/privacy' },
  { label: 'Terms of use', path: '/terms' },
];

const LEGACY_SERVICE_PATHS: Record<string, string> = {
  'Residential solar': '/services#residential',
  'Commercial solar': '/services#commercial',
  'Industrial solar': '/services#industrial',
  'Energy storage': '/services#battery',
  'Battery storage': '/services#battery',
  'Maintenance & monitoring': '/services',
  Maintenance: '/services',
};

export function resolveFooterServiceLinks(
  serviceLinks?: CmsLink[],
  legacyList?: string[],
): CmsLink[] {
  if (serviceLinks?.length) return serviceLinks;
  if (legacyList?.length) {
    return legacyList.map((label) => ({
      label,
      path: LEGACY_SERVICE_PATHS[label] || '/services',
    }));
  }
  return DEFAULT_FOOTER_SERVICE_LINKS;
}

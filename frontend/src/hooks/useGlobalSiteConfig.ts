import { useMemo } from 'react';
import { useCmsPage } from './useCmsPage';
import {
  resolveSiteConfig,
  type SiteContact,
  type SiteCta,
  type SiteImpactStats,
  type SiteSocialLinks,
  type SiteWarrantySummary,
} from '../utils/resolveSiteConfig';
import type { CmsStat } from '../types/cms';

export function useGlobalSiteConfig(): {
  contact: SiteContact;
  social: SiteSocialLinks;
  cta: SiteCta;
  heroStats: CmsStat[];
  impactStats: SiteImpactStats;
  warrantySummary: SiteWarrantySummary;
  loading: boolean;
} {
  const { sections, loading } = useCmsPage('global');
  const config = useMemo(() => resolveSiteConfig(sections), [sections]);
  return { ...config, loading };
}

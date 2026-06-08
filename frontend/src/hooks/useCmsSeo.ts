import type { CmsPageSlug, CmsSeo } from '../types/cms';
import { useCmsPage } from './useCmsPage';

export interface CmsSeoFallback {
  title: string;
  description: string;
  quoteTitle?: string;
}

export function resolveCmsSeo(
  sections: unknown,
  fallback: CmsSeoFallback,
  options?: { isQuoteRequest?: boolean },
) {
  const seo = (sections as { seo?: CmsSeo }).seo;
  const title = options?.isQuoteRequest
    ? seo?.quote_title?.trim() || fallback.quoteTitle || fallback.title
    : seo?.title?.trim() || fallback.title;
  return {
    title,
    description: seo?.description?.trim() || fallback.description,
  };
}

export function useCmsSeo(
  page: Exclude<CmsPageSlug, 'global'>,
  fallback: CmsSeoFallback,
  options?: { isQuoteRequest?: boolean },
) {
  const { sections, loading } = useCmsPage(page);
  return { ...resolveCmsSeo(sections, fallback, options), loading };
}

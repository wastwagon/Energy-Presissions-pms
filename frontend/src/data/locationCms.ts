import { LOCATION_PAGES, getLocationPage, type LocationPageData } from './locationPages';
import type { LocationCmsItem } from '../types/cms';

function mapCmsItem(item: LocationCmsItem): LocationPageData {
  return {
    slug: item.slug,
    city: item.city,
    region: item.region,
    badge: item.badge,
    headline: item.headline,
    description: item.description,
    highlights: item.highlights || [],
    services: item.services || [],
    seoTitle: item.seo_title,
    seoDescription: item.seo_description,
  };
}

export function resolveLocationPage(
  slug: string,
  cmsItems?: LocationCmsItem[] | null,
): LocationPageData | undefined {
  const fromCms = cmsItems?.find((i) => i.slug === slug);
  if (fromCms) return mapCmsItem(fromCms);
  return getLocationPage(slug);
}

export function getDefaultLocationCmsItems(): LocationCmsItem[] {
  return LOCATION_PAGES.map((p) => ({
    slug: p.slug,
    city: p.city,
    region: p.region,
    badge: p.badge,
    headline: p.headline,
    description: p.description,
    highlights: p.highlights,
    services: p.services,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
  }));
}

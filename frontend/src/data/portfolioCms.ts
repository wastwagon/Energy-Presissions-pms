import { portfolioPageItems, type PortfolioPageItem } from './portfolioPageItems';
import type { CmsPortfolioGalleryItem } from '../types/cms';

export function portfolioPageItemToCms(item: PortfolioPageItem): CmsPortfolioGalleryItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    image: item.image,
    location: item.location,
    media_type: item.mediaType || 'image',
    system_size: item.systemSize,
    project_type: item.projectType,
    savings_note: item.savingsNote,
    published: true,
  };
}

export function cmsPortfolioItemToPage(item: CmsPortfolioGalleryItem): PortfolioPageItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    image: item.image,
    location: item.location,
    mediaType: item.media_type === 'video' ? 'video' : 'image',
    systemSize: item.system_size,
    projectType: item.project_type,
    savingsNote: item.savings_note,
  };
}

export const DEFAULT_CMS_PORTFOLIO_ITEMS: CmsPortfolioGalleryItem[] = portfolioPageItems.map(portfolioPageItemToCms);

export function resolvePortfolioItems(cmsItems?: CmsPortfolioGalleryItem[]): PortfolioPageItem[] {
  const published = (cmsItems || []).filter((i) => i.published !== false);
  if (published.length) return published.map(cmsPortfolioItemToPage);
  return portfolioPageItems;
}

export function getPortfolioItemByIdFromCms(
  id: string | undefined,
  cmsItems?: CmsPortfolioGalleryItem[],
): PortfolioPageItem | undefined {
  const items = resolvePortfolioItems(cmsItems);
  const num = Number(id);
  if (!Number.isFinite(num)) return undefined;
  return items.find((p) => p.id === num);
}

export function getPortfolioCategoriesFromItems(items: PortfolioPageItem[]): string[] {
  const cats = new Set(items.map((p) => p.category));
  return ['All', ...Array.from(cats).sort()];
}

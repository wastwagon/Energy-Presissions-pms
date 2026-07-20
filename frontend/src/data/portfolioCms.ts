import { portfolioPageItems, type PortfolioPageItem } from './portfolioPageItems';
import type { CmsPortfolioGalleryItem, CmsPortfolioItem } from '../types/cms';

export function slugifyPortfolioTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'project';
}

export function ensureUniquePortfolioSlug(
  desired: string,
  items: { id: number; slug?: string }[],
  selfId?: number,
): string {
  const base = slugifyPortfolioTitle(desired);
  const taken = new Set(
    items
      .filter((item) => item.id !== selfId)
      .map((item) => (item.slug || '').toLowerCase())
      .filter(Boolean),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

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
    slug: item.slug || slugifyPortfolioTitle(item.title),
    body: item.body || '',
    gallery_images: item.galleryImages || [],
    featured: Boolean(item.featured),
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
    slug: item.slug || slugifyPortfolioTitle(item.title || `project-${item.id}`),
    body: item.body || '',
    galleryImages: (item.gallery_images || []).map((u) => String(u).trim()).filter(Boolean),
    featured: Boolean(item.featured),
  };
}

export const DEFAULT_CMS_PORTFOLIO_ITEMS: CmsPortfolioGalleryItem[] = portfolioPageItems.map(portfolioPageItemToCms);

function sortFeaturedFirst(items: PortfolioPageItem[]): PortfolioPageItem[] {
  const featured = items.filter((item) => item.featured);
  const rest = items.filter((item) => !item.featured);
  return [...featured, ...rest];
}

export function resolvePortfolioItems(cmsItems?: CmsPortfolioGalleryItem[]): PortfolioPageItem[] {
  // Empty / missing CMS list → bundled gallery. A non-empty saved list owns the
  // gallery even if every item is unpublished (so draft overrides stay in effect).
  if (!cmsItems || cmsItems.length === 0) {
    return sortFeaturedFirst(portfolioPageItems.map((item) => ({
      ...item,
      slug: item.slug || slugifyPortfolioTitle(item.title),
      body: item.body || '',
      galleryImages: item.galleryImages || [],
      featured: Boolean(item.featured),
    })));
  }
  return sortFeaturedFirst(
    cmsItems.filter((i) => i.published !== false).map(cmsPortfolioItemToPage),
  );
}

export function getPortfolioItemPath(item: Pick<PortfolioPageItem, 'id' | 'slug'>): string {
  return `/portfolio/${item.slug || item.id}`;
}

export function getPortfolioItemByIdFromCms(
  id: string | undefined,
  cmsItems?: CmsPortfolioGalleryItem[],
): PortfolioPageItem | undefined {
  return getPortfolioItemByParamFromCms(id, cmsItems);
}

/** Resolve by slug or numeric id (keeps old /portfolio/101 links working). */
export function getPortfolioItemByParamFromCms(
  param: string | undefined,
  cmsItems?: CmsPortfolioGalleryItem[],
): PortfolioPageItem | undefined {
  if (!param) return undefined;
  const items = resolvePortfolioItems(cmsItems);
  const bySlug = items.find((p) => p.slug === param);
  if (bySlug) return bySlug;
  const num = Number(param);
  if (!Number.isFinite(num)) return undefined;
  return items.find((p) => p.id === num);
}

export function getPortfolioCategoriesFromItems(items: PortfolioPageItem[]): string[] {
  const cats = new Set(items.map((p) => p.category));
  return ['All', ...Array.from(cats).sort()];
}

/** Map featured portfolio projects into the home teaser shape. */
export function featuredPortfolioToHomeTeasers(
  cmsItems?: CmsPortfolioGalleryItem[],
  limit = 6,
): CmsPortfolioItem[] {
  return resolvePortfolioItems(cmsItems)
    .filter((item) => item.featured)
    .slice(0, limit)
    .map((item) => ({
      title: item.title,
      image: item.image,
      alt: item.title,
      link: getPortfolioItemPath(item),
    }));
}

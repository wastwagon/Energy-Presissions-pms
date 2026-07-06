/**
 * Blog utilities — article content lives in the database (seeded on deploy).
 * Use GET /api/content/blog for listings and article bodies.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  readTime: string;
  featuredImage: string;
  paragraphs: string[];
}

export const BLOG_CATEGORIES = ['All', 'Planning', 'Systems', 'Ghana'] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

const DEFAULT_BLOG_IMAGE = '/website_images/services-commercial-solar.png';

/** Resolve featured image from CMS value or site default. */
export function resolveBlogFeaturedImage(_slug: string, cmsImage?: string | null): string {
  const trimmed = cmsImage?.trim();
  if (trimmed) return trimmed;
  return DEFAULT_BLOG_IMAGE;
}

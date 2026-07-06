import type { BlogPost } from '../data/blogPosts';
import { resolveBlogFeaturedImage } from '../data/blogPosts';

export type ApiBlogRow = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  display_date: string;
  read_time: string;
  category?: string;
  featured_image?: string;
};

export type BlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featuredImage: string;
};

export function mapApiBlogListRow(row: ApiBlogRow): BlogListItem {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category || 'Ghana',
    date: row.display_date,
    readTime: row.read_time,
    featuredImage: resolveBlogFeaturedImage(row.slug, row.featured_image),
  };
}

export function mapApiBlogArticle(row: ApiBlogRow): BlogPost {
  const body = row.body || '';
  const paragraphs = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category || 'Ghana',
    date: row.display_date,
    readTime: row.read_time,
    featuredImage: resolveBlogFeaturedImage(row.slug, row.featured_image),
    paragraphs: paragraphs.length ? paragraphs : [body.trim() || row.excerpt],
  };
}

export function sortBlogPostsNewestFirst(posts: BlogListItem[]): BlogListItem[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

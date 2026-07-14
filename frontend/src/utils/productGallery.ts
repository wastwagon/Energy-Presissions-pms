/** Normalize gallery_images from API (array or legacy object) to URL strings. */
export function parseGalleryImages(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.images)) return parseGalleryImages(obj.images);
    return Object.values(obj).filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0
    );
  }
  return [];
}

/** Featured image first, then gallery URLs (deduped). */
export function productImageUrls(product: {
  image_url?: string | null;
  gallery_images?: unknown;
}): string[] {
  const featured = product.image_url?.trim();
  const gallery = parseGalleryImages(product.gallery_images);
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const url of featured ? [featured, ...gallery] : gallery) {
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

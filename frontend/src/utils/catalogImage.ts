import { resolveMediaUrl } from './mediaUrl';

/** Branded static fallbacks when a product has no image_url (served from frontend origin). */
const TYPE_FALLBACKS: Record<string, string> = {
  panel: '/website_images/service-commercial-solar.png',
  inverter: '/website_images/service-industrial-solar.png',
  battery: '/website_images/service-battery-storage-solutions.png',
  mounting: '/website_images/services-industrial-solar.png',
  bos: '/website_images/service-maintenance-monitoring.png',
  other: '/website_images/service-maintenance-monitoring.png',
};

const DEFAULT_FALLBACK = TYPE_FALLBACKS.other;

function fallbackForCategory(category?: string | null): string | undefined {
  const cat = (category || '').toLowerCase();
  if (cat.includes('panel')) return TYPE_FALLBACKS.panel;
  if (cat.includes('inverter')) return TYPE_FALLBACKS.inverter;
  if (cat.includes('batter')) return TYPE_FALLBACKS.battery;
  if (cat.includes('accessor')) return TYPE_FALLBACKS.other;
  return undefined;
}

export function resolveCatalogImageUrl(product: {
  image_url?: string | null;
  product_type?: string | null;
  category?: string | null;
}): string {
  const fromDb = resolveMediaUrl(product.image_url);
  if (fromDb) return fromDb;

  const type = (product.product_type || '').toLowerCase();
  if (type && TYPE_FALLBACKS[type]) return TYPE_FALLBACKS[type];

  return fallbackForCategory(product.category) || DEFAULT_FALLBACK;
}

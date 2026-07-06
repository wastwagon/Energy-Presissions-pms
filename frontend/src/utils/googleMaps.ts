import type { SiteContact } from './resolveSiteConfig';
import { resolveSiteContact } from './resolveSiteConfig';

function resolvePlaceId(cmsPlaceId?: string | null, contact?: SiteContact): string {
  return cmsPlaceId?.trim() || contact?.googlePlaceId?.trim() || '';
}

export function googleMapsReadUrl(cmsPlaceId?: string | null, contact?: SiteContact): string {
  const resolvedContact = contact || resolveSiteContact();
  const placeId = resolvePlaceId(cmsPlaceId, resolvedContact);
  if (placeId) {
    return `https://www.google.com/maps/search/?api=1&query=place_id:${encodeURIComponent(placeId)}`;
  }
  return resolvedContact.googleMapsReviewUrl;
}

export function googleMapsWriteReviewUrl(cmsPlaceId?: string | null, contact?: SiteContact): string {
  const resolvedContact = contact || resolveSiteContact();
  const placeId = resolvePlaceId(cmsPlaceId, resolvedContact);
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }
  return resolvedContact.googleMapsWriteReviewUrl;
}

export function googleMapsEmbedUrl(cmsPlaceId?: string | null, contact?: SiteContact): string | null {
  const resolvedContact = contact || resolveSiteContact();
  const placeId = resolvePlaceId(cmsPlaceId, resolvedContact);
  if (placeId) {
    return `https://maps.google.com/maps?q=place_id:${placeId}&hl=en&z=15&output=embed`;
  }
  return resolvedContact.googleMapsEmbedUrl || null;
}

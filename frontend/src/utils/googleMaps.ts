import { COMPANY } from '../data/companyContact';

function resolvePlaceId(cmsPlaceId?: string | null): string {
  return cmsPlaceId?.trim() || COMPANY.googlePlaceId?.trim() || '';
}

export function googleMapsReadUrl(cmsPlaceId?: string | null): string {
  const placeId = resolvePlaceId(cmsPlaceId);
  if (placeId) {
    return `https://www.google.com/maps/search/?api=1&query=place_id:${encodeURIComponent(placeId)}`;
  }
  return COMPANY.googleMapsReviewUrl;
}

export function googleMapsWriteReviewUrl(cmsPlaceId?: string | null): string {
  const placeId = resolvePlaceId(cmsPlaceId);
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }
  return COMPANY.googleMapsWriteReviewUrl;
}

export function googleMapsEmbedUrl(cmsPlaceId?: string | null): string | null {
  const placeId = resolvePlaceId(cmsPlaceId);
  if (placeId) {
    return `https://maps.google.com/maps?q=place_id:${placeId}&hl=en&z=15&output=embed`;
  }
  return COMPANY.googleMapsEmbedUrl || null;
}

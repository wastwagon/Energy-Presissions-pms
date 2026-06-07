import { COMPANY } from '../data/companyContact';

export function googleMapsWriteReviewUrl(): string {
  const placeId = COMPANY.googlePlaceId?.trim();
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }
  return COMPANY.googleMapsWriteReviewUrl;
}

export function googleMapsEmbedUrl(): string | null {
  const placeId = COMPANY.googlePlaceId?.trim();
  if (placeId) {
    return `https://maps.google.com/maps?q=place_id:${placeId}&hl=en&z=15&output=embed`;
  }
  return COMPANY.googleMapsEmbedUrl || null;
}

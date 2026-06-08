import type { CmsGoogleReviews, CmsTestimonial } from '../types/cms';

export type GoogleReviewDisplay = {
  rating: number | null;
  reviewCount: number | null;
  source: 'google' | 'testimonials' | null;
};

function averageTestimonialRating(items: CmsTestimonial[]): number | null {
  const rated = items.filter((t) => typeof t.rating === 'number' && t.rating > 0);
  if (!rated.length) return null;
  const sum = rated.reduce((acc, t) => acc + t.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

/** Prefer CMS Google values; fall back to averaged on-site testimonials (never hardcode 5). */
export function resolveGoogleReviewDisplay(
  googleReviews?: CmsGoogleReviews | null,
  testimonials?: CmsTestimonial[] | null,
): GoogleReviewDisplay {
  const cmsRating = Number(googleReviews?.rating);
  if (Number.isFinite(cmsRating) && cmsRating > 0 && cmsRating <= 5) {
    const count = Number(googleReviews?.review_count);
    return {
      rating: cmsRating,
      reviewCount: Number.isFinite(count) && count > 0 ? Math.round(count) : null,
      source: 'google',
    };
  }

  const avg = averageTestimonialRating(testimonials || []);
  if (avg != null) {
    return {
      rating: avg,
      reviewCount: testimonials?.length ?? null,
      source: 'testimonials',
    };
  }

  return { rating: null, reviewCount: null, source: null };
}

export function formatReviewCountLabel(count: number | null, source: GoogleReviewDisplay['source']): string | null {
  if (!count || count <= 0) return null;
  if (source === 'google') return `${count} Google review${count === 1 ? '' : 's'}`;
  return `Based on ${count} client testimonial${count === 1 ? '' : 's'}`;
}

/** Routes that show PublicStickyMobileCta — WhatsApp FAB is hidden on these to avoid crowding. */
export const STICKY_CTA_PATHS = [
  '/services',
  '/solar-packages',
  '/contact',
  '/financing',
  '/portfolio',
  '/solar-accra',
  '/solar-kumasi',
  '/solar-tamale',
  '/solar-estimate',
  '/checkout/success',
  '/blog',
  '/about',
  '/faqs',
  '/shop',
  '/referral',
  '/reviews',
  '/warranty',
  '/privacy',
  '/terms',
] as const;

export function pathHasStickyCta(pathname: string): boolean {
  if (pathname.startsWith('/blog/') && pathname !== '/blog') return true;
  return STICKY_CTA_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

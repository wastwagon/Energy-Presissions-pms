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
] as const;

export function pathHasStickyCta(pathname: string): boolean {
  return STICKY_CTA_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

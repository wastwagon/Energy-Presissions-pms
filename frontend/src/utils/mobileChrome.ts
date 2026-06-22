/** Reserved space (px) for the fixed bottom tab bar above the safe area. */
export const MOBILE_TAB_BAR_RESERVE = 64;

/** Height (px) of PublicStickyMobileCta — sits above the tab bar. */
export const MOBILE_STICKY_CTA_RESERVE = 64;

/** Height (px) of fixed mobile checkout action bar. */
export const MOBILE_CHECKOUT_BAR_RESERVE = 72;

/** Bottom offset for elements stacked above the tab bar (matches sticky CTA positioning). */
export const MOBILE_ABOVE_TAB_BAR = 56;

/** Height (px) of fixed mobile product detail action bar. */
export const MOBILE_PRODUCT_BAR_RESERVE = 64;

/** Extra bottom reserve for pages with fixed mobile chrome above the tab bar. */
export function mobileExtraChromeReserve(pathname: string): number {
  if (pathname === '/checkout') return MOBILE_CHECKOUT_BAR_RESERVE;
  if (pathname.startsWith('/products/')) return MOBILE_PRODUCT_BAR_RESERVE;
  return 0;
}

/**
 * optional sticky CTA bar, optional extra chrome (e.g. checkout bar), and safe area.
 */
export function mobileMainPaddingBottom(hasStickyCta: boolean, extraReserve = 0): string {
  const chrome =
    MOBILE_TAB_BAR_RESERVE +
    (hasStickyCta ? MOBILE_STICKY_CTA_RESERVE : 0) +
    extraReserve;
  return `calc(${chrome}px + env(safe-area-inset-bottom, 0px))`;
}

/** Fixed-element bottom offset above tab bar + safe area. */
export function mobileFixedAboveTabBar(extraPx = 0): string {
  return `calc(${MOBILE_ABOVE_TAB_BAR + extraPx}px + env(safe-area-inset-bottom, 0px))`;
}

/** Fixed checkout action bar — stacked above tab bar (same offset as sticky CTA). */
export function mobileCheckoutBarBottom(): string {
  return mobileFixedAboveTabBar();
}

/**
 * GA4 — optional. Set REACT_APP_GA4_MEASUREMENT_ID at build time (e.g. G-XXXXXXXXXX).
 * SPA: page views fire on route changes via App.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.REACT_APP_GA4_MEASUREMENT_ID;

let scriptRequested = false;

export function isAnalyticsEnabled(): boolean {
  return Boolean(GA_ID && GA_ID.startsWith('G-'));
}

export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || typeof document === 'undefined' || scriptRequested) {
    return;
  }
  scriptRequested = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID!)}`;
  document.head.appendChild(script);
}

/** Call on SPA navigations after document title updates (e.g. after Helmet). */
export function trackPageView(pathWithSearch: string, pageTitle?: string): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: pathWithSearch,
    page_title: pageTitle,
    send_to: GA_ID,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  window.gtag('event', name, params);
}

/** Contact / quote form successfully submitted */
export function trackGenerateLead(source: 'contact_form' | 'quote_request'): void {
  trackEvent('generate_lead', {
    currency: 'GHS',
    value: 0,
    lead_source: source,
  });
}

export type GaCommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

function itemsPayload(items: GaCommerceItem[]) {
  return items.map((i) => ({
    item_id: i.item_id,
    item_name: i.item_name,
    price: i.price,
    quantity: i.quantity,
  }));
}

/** Product detail viewed */
export function trackViewItem(item: GaCommerceItem): void {
  const value = item.price * item.quantity;
  trackEvent('view_item', {
    currency: 'GHS',
    value,
    items: itemsPayload([item]),
  });
}

/** After a successful add-to-cart API call */
export function trackAddToCart(items: GaCommerceItem[]): void {
  const value = items.reduce((s, i) => s + i.price * i.quantity, 0);
  trackEvent('add_to_cart', {
    currency: 'GHS',
    value,
    items: itemsPayload(items),
  });
}

/** Checkout page loaded with a non-empty cart */
export function trackBeginCheckout(items: GaCommerceItem[], value: number): void {
  trackEvent('begin_checkout', {
    currency: 'GHS',
    value,
    items: itemsPayload(items),
  });
}

/** E-commerce payment confirmed (GA4 recommended purchase params) */
export function trackPurchase(payload: {
  transaction_id: string;
  value: number;
  currency?: string;
}): void {
  trackEvent('purchase', {
    transaction_id: payload.transaction_id,
    value: payload.value,
    currency: payload.currency ?? 'GHS',
  });
}

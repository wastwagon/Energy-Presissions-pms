/** Register the PWA service worker in production builds only. */

export function registerServiceWorker(): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL || ''}/sw.js`)
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}

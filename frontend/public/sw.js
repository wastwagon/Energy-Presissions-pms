/**
 * Minimal PWA service worker — caches the app shell; network-first for navigations and API.
 */
const CACHE = 'ep-shell-v3';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.json', '/favicon.svg', '/icons/icon-192.png'];

const shouldBypass = (pathname) =>
  pathname.startsWith('/api') ||
  pathname.includes('paystack') ||
  pathname.startsWith('/web/app') ||
  pathname.startsWith('/pms');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API, payments, and admin CMS — always network (no SW interception)
  if (shouldBypass(url.pathname)) return;

  // SPA navigations — network first, fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put('/index.html', copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((r) => r || caches.match('/') || caches.match('/offline.html'))
            .then((r) => r || Response.error()),
        ),
    );
    return;
  }

  // Static assets — stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

/* The Smith Report PWA shell. Live mortgage and market APIs are never cached here. */
const CACHE_PREFIX = 'smith-report-';
const CORE_CACHE = CACHE_PREFIX + 'core-v7';
const IMAGE_CACHE = CACHE_PREFIX + 'images-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/css/report.css?v=8',
  '/assets/js/report.js?v=15',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  '/assets/images/hero-denver.png',
  '/assets/images/market-workspace.png',
  '/assets/images/partner-consultation.png',
  '/assets/images/application-qr.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CORE_CACHE).then((cache) => cache.addAll(SHELL))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(
    names.filter((name) => name.startsWith(CACHE_PREFIX) &&
      name !== CORE_CACHE && name !== IMAGE_CACHE).map((name) => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // External feeds, fonts, analytics, forms and chat always use the network.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, { cache: 'no-store' }).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CORE_CACHE).then((cache) => cache.put('/', copy)));
      }
      return response;
    }).catch(async () => (await caches.match('/')) ||
      new Response('The Smith Report is unavailable offline.', { status: 503 })));
    return;
  }

  // Scripts and styles update online; the last working copy remains available offline.
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(fetch(request, { cache: 'no-store' }).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CORE_CACHE).then((cache) => cache.put(request, copy)));
      }
      return response;
    }).catch(() => caches.match(request)));
    return;
  }

  // Icons and editorial images can be served immediately from the app cache.
  if (/\.(?:png|jpg|jpeg|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request, { cache: 'no-store' }).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(IMAGE_CACHE).then((cache) => cache.put(request, copy)));
      }
      return response;
    })));
  }
});

// Service worker. Caching strategy:
//   - HTML navigations -> network-first (offline.html when offline)
//   - /_next/static/   -> cache-first (content-hashed = immutable)
//   - everything else  -> stale-while-revalidate
// ponytail: no full-route precache, so unvisited pages fall back to offline.html.
// Bump CACHE to force a refresh.
const CACHE = 'rubenp-v2';
const OFFLINE_URL = '/offline.html';

// Skip caching error/redirect responses and dynamic/private ones (draft-mode HTML).
function isCacheable(res) {
  if (!res || !res.ok) return false;
  return !/no-store|private/i.test(res.headers.get('Cache-Control') || '');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API routes or the Sanity Studio shell (it has its own scope).
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin'))
    return;

  // HTML navigations: network-first, fall back to cached page, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (isCacheable(res)) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Content-hashed build assets are immutable: cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Everything else (images, fonts, etc.): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (isCacheable(res)) cache.put(request, res.clone());
          return res;
        })
        .catch(() => undefined);
      return cached || (await network) || Response.error();
    })()
  );
});

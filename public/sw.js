// Service worker: light offline support without a build-time precache.
//   - page navigations: network first, fall back to a cached copy, then /offline.html
//   - /_next/static assets: cache first (filenames are content-hashed)
//   - images, fonts, css: stale-while-revalidate
// Bump CACHE to invalidate everything on the next visit.
const CACHE = 'rubenp-v2';
const OFFLINE_URL = '/offline.html';
const RUNTIME_CACHEABLE = new Set(['image', 'font', 'style']);

// Don't cache error/redirect responses or anything marked no-store/private (e.g. draft-mode HTML).
function isCacheable(res) {
  if (!res || !res.ok) return false;
  return !/no-store|private/i.test(res.headers.get('Cache-Control') || '');
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
});

self.addEventListener('activate', (event) => {
  // Activates only once no old tabs remain, so dropping previous caches is safe.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Leave API routes, the Sanity Studio, and React Server Component requests to the network.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    request.headers.get('RSC')
  )
    return;

  // Page navigations: network first; offline falls back to a cached copy, then /offline.html.
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
        .catch(
          async () => (await caches.match(request)) || caches.match(OFFLINE_URL)
        )
    );
    return;
  }

  // Content-hashed build assets never change: cache first.
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

  // Static sub-resources only (images, fonts, css): stale-while-revalidate.
  if (!RUNTIME_CACHEABLE.has(request.destination)) return;
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

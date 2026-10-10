// Service worker: light offline support without a build-time precache.
//   - page navigations: network first, fall back to a cached copy, then /offline.html
//   - /_next/static assets: cache first (filenames are content-hashed)
//   - images, fonts, css: stale-while-revalidate
// Bump VERSION to drop every cache once the new worker activates.
const VERSION = 'v4';
const OFFLINE_CACHE = `rubenp-offline-${VERSION}`;
const OFFLINE_URL = '/offline.html';
const RUNTIME_CACHEABLE = new Set(['image', 'font', 'style']);

// Pages and image widths pile up, so those caches keep the newest few. Build
// chunks are not capped: dropping one would leave a cached page that needs it
// broken offline, and hashed chunks are small. The whole set goes when VERSION
// changes, which only happens once no open page is using the old worker.
const LIMITS = { pages: 30, assets: 100 };
const cacheName = (kind) => `rubenp-${kind}-${VERSION}`;

// Don't cache partial, error or redirect responses, or anything marked
// no-store/private (e.g. draft-mode HTML).
function isCacheable(res) {
  if (!res || res.status !== 200) return false;
  return !/no-store|private/i.test(res.headers.get('Cache-Control') || '');
}

// Cache keys come back in insertion order, so the oldest go first.
async function store(kind, request, res) {
  const cache = await caches.open(cacheName(kind));
  await cache.put(request, res);
  if (!LIMITS[kind]) return;
  const keys = await cache.keys();
  const excess = keys.length - LIMITS[kind];
  if (excess > 0)
    await Promise.all(keys.slice(0, excess).map((k) => cache.delete(k)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // Vercel redirects /offline.html to /offline, and a navigation can't be
      // answered with a redirected response, so store a plain copy.
      const res = await fetch(OFFLINE_URL, { cache: 'reload' });
      if (!res.ok) throw new Error(`${OFFLINE_URL}: ${res.status}`);
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.put(
        OFFLINE_URL,
        new Response(await res.blob(), { headers: res.headers })
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  const current = [OFFLINE_CACHE, ...['pages', 'static', 'assets'].map(cacheName)];
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('rubenp-') && !current.includes(k))
          .map((k) => caches.delete(k))
      );
      // Starts the page request while the worker boots.
      await self.registration.navigationPreload?.enable();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // CMS images come from their own CDNs, so offline copies show without them.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Leave API routes, the Sanity Studio, and React Server Component requests to
  // the network. Their navigations still take the preload, so it isn't wasted.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    request.headers.has('RSC')
  ) {
    if (request.mode === 'navigate')
      event.respondWith(
        (async () => (await event.preloadResponse) || fetch(request))()
      );
    return;
  }

  // Page navigations: network first, taking the preloaded response when there
  // is one; offline falls back to a cached copy, then /offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = (await event.preloadResponse) || (await fetch(request));
          if (isCacheable(res))
            event.waitUntil(store('pages', request, res.clone()));
          return res;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match(OFFLINE_URL)) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // Content-hashed build assets never change: cache first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // The Studio's bundle is large and only the owner uses it: skip it.
        const client = await self.clients.get(event.clientId);
        if (client && new URL(client.url).pathname.startsWith('/admin')) return fetch(request);
        const res = await fetch(request);
        // Dev chunks are not hashed and come back without `immutable`.
        if (isCacheable(res) && /immutable/.test(res.headers.get('Cache-Control') || ''))
          event.waitUntil(store('static', request, res.clone()));
        return res;
      })()
    );
    return;
  }

  // Static sub-resources only (images, fonts, css): stale-while-revalidate.
  if (!RUNTIME_CACHEABLE.has(request.destination)) return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      const network = fetch(request).catch(() => undefined);
      // Keep the worker alive for the refresh even when the cached copy wins.
      event.waitUntil(
        network.then(
          (res) => isCacheable(res) && store('assets', request, res.clone())
        )
      );
      return cached || (await network) || Response.error();
    })()
  );
});

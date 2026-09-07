import { stegaClean } from '@sanity/client/stega';
import groq from 'groq';
import { isSafeHref, resolveLink } from './processUrl';

// Match a request path against a redirect doc's source pattern
// ('/old-path', '/old-path/:slug') and fill params into the destination.
export function matchRedirect({ source, destination }, path) {
  const pattern = stegaClean(source).split('/');
  const segments = path.split('/');
  if (pattern.length !== segments.length) return null;

  const params = {};
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i].startsWith(':')) params[pattern[i].slice(1)] = segments[i];
    else if (pattern[i] !== segments[i]) return null;
  }

  const url = stegaClean(destination).replace(/:(\w+)/g, (all, name) =>
    name in params ? encodeURIComponent(params[name]) : all
  );
  return isSafeHref(url) ? url : null;
}

// The redirect a path should follow, or null. Cached briefly rather than
// no-store: a no-store fetch turns the static catch-all route dynamic at
// request time, which Next rejects with a 500 for paths not built ahead.
export async function getRedirect(path) {
  // imported lazily so matchRedirect stays importable from bun test
  const [{ default: client }, { linkQuery }] = await Promise.all([
    import('@/lib/sanity/client'),
    import('@/lib/sanity/queries/fragments/link')
  ]);
  const redirects = await client.fetch(
    groq`*[_type == 'redirect']{
      source,
      destination{ ${linkQuery} },
      permanent
    }`,
    {},
    { perspective: 'published', next: { revalidate: 60 } }
  );

  for (const { source, destination, permanent } of redirects ?? []) {
    const resolved = resolveLink(destination);
    if (!resolved) continue;
    const url = matchRedirect({ source, destination: resolved }, path);
    if (url)
      return { url, label: destination.label ?? null, permanent: !!permanent };
  }
  return null;
}

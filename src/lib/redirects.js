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

  const url = stegaClean(destination).replace(
    /:(\w+)/g,
    (all, name) => params[name] ?? all
  );
  return isSafeHref(url) ? url : null;
}

// The redirect a path should follow, or null. Uncached on purpose: this only
// runs on paths that missed a page, and sanityFetch would cache an empty
// result for good.
export async function getRedirect(path) {
  // imported lazily so matchRedirect stays importable from bun test
  const { default: client } = await import('@/lib/sanity/client');
  const redirects = await client.fetch(
    groq`*[_type == 'redirect']{
      source,
      destination{ label, type, external, params, internal->{ metadata { "slug": slug.current } } },
      permanent
    }`,
    {},
    { perspective: 'published', cache: 'no-store' }
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

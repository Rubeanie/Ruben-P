import { stegaClean } from '@sanity/client/stega';

// Page slugs already carry the full path, so the trail comes out of the slug alone.
export function pagePath(page) {
  const slug = stegaClean(page?.metadata?.slug);
  if (typeof slug !== 'string') return null;
  const trimmed = slug.replace(/^\/+|\/+$/g, '');
  if (!trimmed) return null;
  return trimmed === 'index' ? '/' : `/${trimmed}`;
}

export function ancestorPaths(path) {
  const segments = path
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);
  return segments
    .slice(0, -1)
    .map((_, i) => `/${segments.slice(0, i + 1).join('/')}`);
}

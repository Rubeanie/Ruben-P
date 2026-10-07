import { stegaClean } from '@sanity/client/stega';
import { isPagePath } from './slug';

// Page slugs already carry the full path, so the trail comes out of the slug alone.
export function pagePath(page) {
  const slug = stegaClean(page?.metadata?.slug);
  return isPagePath(slug) ? slug : null;
}

export function ancestorPaths(path) {
  const segments = path.split('/').filter(Boolean);
  return segments
    .slice(0, -1)
    .map((_, i) => `/${segments.slice(0, i + 1).join('/')}`);
}

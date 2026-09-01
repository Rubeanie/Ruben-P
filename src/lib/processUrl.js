import { stegaClean } from '@sanity/client/stega';
import { baseUrl } from '@/lib/env';

// Resolve a `link` GROQ fragment (internal page reference or external URL) to an href.
export function resolveLink({ type, external, params, internal } = {}) {
  const cleanType = stegaClean(type);
  if (cleanType === 'internal' && internal?.metadata?.slug) {
    return processUrl(internal, { base: false, params });
  }
  if (cleanType === 'external' && external) return stegaClean(external);
  return null;
}

export default function processUrl(page, { base = true, params } = {}) {
  // Queries project `"slug": slug.current` (flat string); raw documents nest it.
  // stegaClean strips visual-editing payloads that would corrupt the URL.
  const slug = stegaClean(
    page?.metadata?.slug?.current ?? page?.metadata?.slug
  );
  const path = slug === 'index' ? '' : slug;

  return `${base ? baseUrl : ''}/${[path, stegaClean(params)].filter(Boolean).join('/')}`;
}

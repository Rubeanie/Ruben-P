import { stegaClean } from '@sanity/client/stega';
import { baseUrl } from '@/lib/env';

const BLOCKED_SCHEMES = new Set([
  'javascript:',
  'data:',
  'vbscript:',
  'blob:',
  'file:'
]);

// CMS hrefs may use app schemes (steam://, modrinth://), so block the executable
// ones rather than allowlisting. Checked on the parsed protocol, which strips
// the whitespace tricks like `java\nscript:` that beat a string check.
export function isSafeHref(url) {
  try {
    return !BLOCKED_SCHEMES.has(
      new URL(url, 'https://relative.invalid').protocol
    );
  } catch {
    return false;
  }
}

// Resolve a `link` GROQ fragment (internal page reference or external URL) to an href.
export function resolveLink({ type, external, params, internal } = {}) {
  const cleanType = stegaClean(type);
  if (cleanType === 'internal' && internal?.metadata?.slug) {
    return processUrl(internal, { base: false, params });
  }
  if (cleanType === 'external' && external) {
    const url = stegaClean(external);
    return isSafeHref(url) ? url : null;
  }
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

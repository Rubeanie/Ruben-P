import { stegaClean } from '@sanity/client/stega';
import { baseUrl } from '@/lib/env';
import { isPagePath } from './slug';

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

// Queries project `"slug": slug.current` (flat string); raw documents nest it.
// stegaClean strips visual-editing payloads that would corrupt the URL.
export const slugOf = (page) =>
  stegaClean(page?.metadata?.slug?.current ?? page?.metadata?.slug);

// Params are only ever a query or fragment; anything else would change the path.
const suffixOf = (params) => {
  const clean = stegaClean(params);
  return /^[?#]/.test(clean ?? '') ? clean : '';
};

// Resolve a `link` GROQ fragment (internal page reference or external URL) to an href.
export function resolveLink(link) {
  const { type, external, params, internal } = link ?? {};
  const cleanType = stegaClean(type);
  // No safe path for a malformed or template-only slug.
  if (cleanType === 'internal')
    return isPagePath(slugOf(internal))
      ? processUrl(internal, { base: false, params })
      : null;
  if (cleanType === 'external' && external) {
    const url = stegaClean(external) + suffixOf(params);
    return isSafeHref(url) ? url : null;
  }
  return null;
}

export default function processUrl(page, { base = true, params } = {}) {
  const slug = slugOf(page);
  const path = isPagePath(slug) ? slug.slice(1) : '';

  return `${base ? baseUrl : ''}/${path}${suffixOf(params)}`;
}

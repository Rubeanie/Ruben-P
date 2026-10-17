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

// An external URL with stored params spliced in as text, so its own query
// keeps its exact encoding: their query joins the URL's, their fragment
// replaces its fragment.
function withParams(url, params) {
  const suffix = suffixOf(params);
  if (!suffix) return url;
  const at = suffix.indexOf('#');
  const query = suffix.startsWith('?')
    ? suffix.slice(1, at < 0 ? undefined : at)
    : '';
  const fragment = at < 0 ? '' : suffix.slice(at);
  const hashAt = url.indexOf('#');
  let head = hashAt < 0 ? url : url.slice(0, hashAt);
  // A trailing ? or & only separates when the URL has a query to begin with.
  if (query)
    head += !head.includes('?')
      ? `?${query}`
      : /[?&]$/.test(head)
        ? query
        : `&${query}`;
  return head + (fragment || (hashAt < 0 ? '' : url.slice(hashAt)));
}

// A redirect doc as a link target: an internal destination goes straight to
// its page, anything else through the vanity source (never the external URL).
export function resolveRedirect(redirect) {
  const { source, destination } = redirect ?? {};
  if (stegaClean(destination?.type) === 'internal') {
    const href = resolveLink(destination);
    if (href) return href;
  }
  // A pattern source (/old/:slug) is no URL.
  const path = stegaClean(source);
  return isInternalHref(path) && !path.includes(':') && isSafeHref(path)
    ? path
    : null;
}

// Resolve a `link` GROQ fragment (internal page reference, external URL or redirect) to an href.
export function resolveLink(link) {
  const { type, external, params, internal, redirect } = link ?? {};
  const cleanType = stegaClean(type);
  // No safe path for a malformed or template-only slug.
  if (cleanType === 'internal')
    return isPagePath(slugOf(internal))
      ? processUrl(internal, { base: false, params })
      : null;
  // The destination's own params apply; the vanity path would drop any added here.
  if (cleanType === 'redirect') return resolveRedirect(redirect);
  if (cleanType === 'external' && external) {
    const url = stegaClean(external);
    if (!isSafeHref(url)) return null;
    const merged = withParams(url, params);
    return isSafeHref(merged) ? merged : null;
  }
  return null;
}

export default function processUrl(page, { base = true, params } = {}) {
  const slug = slugOf(page);
  const path = isPagePath(slug) ? slug.slice(1) : '';

  return `${base ? baseUrl : ''}/${path}${suffixOf(params)}`;
}

// A site path, not a protocol-relative URL, a hash anchor or another scheme.
// Browsers read /\ as //, another host.
export const isInternalHref = (href) => /^\/(?![/\\])/.test(href ?? '');

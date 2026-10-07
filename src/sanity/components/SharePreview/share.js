import { resolveMetadata } from '@/lib/resolveMetadata';
import { SHARE_IMAGE } from '@/lib/shareImage/layout';
import { shareImageUrl } from '@/lib/shareImage/url';
import { templateSlugs } from '@/lib/slug';

// Next percent-encodes the address and drops a bare origin's trailing slash.
const encoded = (url) =>
  new URL(url).href.replace(/^(https?:\/\/[^/]+)\/$/, '$1');

// Flattens resolveMetadata's object into the tags the head carries.
function shareTags(metadata, themeColor) {
  const { openGraph: og, twitter } = metadata;
  return {
    title: metadata.title || null,
    description: metadata.description || null,
    robots: metadata.robots.index ? 'index, follow' : 'noindex, nofollow',
    // The page address canonical and og:url carry; cards show it even when og:url is absent.
    url: encoded(metadata.alternates.canonical),
    ogTitle: og?.title ?? null,
    ogDescription: og?.description ?? null,
    ogSiteName: og?.siteName || null,
    ogImage: og?.images[0]?.url ?? null,
    twitterCard: twitter.card,
    twitterTitle: twitter.title ?? null,
    twitterDescription: twitter.description ?? null,
    twitterImage: twitter.images[0]?.url ?? null,
    themeColor
  };
}

// Names where each shipped value came from by matching it against the fields in fallback order.
function sourcesOf(page, site, tags) {
  const p = page?.metadata?.seo ?? {};
  const s = site?.seo ?? {};
  const pick = (value, candidates) => {
    if (value == null || value === '')
      return { kind: 'missing', label: 'Not set' };
    const hit = candidates.find(([v]) => v != null && v === value);
    return hit
      ? { kind: hit[1], label: hit[2] }
      : { kind: 'derived', label: 'Derived' };
  };
  const img = (image) => image?.asset?.url;

  return {
    title: pick(tags.title, [
      [p.metaTitle, 'page', 'Meta title'],
      [page?.title, 'page', 'Page title'],
      [s.metaTitle, 'site', 'Site settings']
    ]),
    description: pick(tags.description, [
      [p.metaDescription, 'page', 'Meta description'],
      [s.metaDescription, 'site', 'Site settings']
    ]),
    ogTitle: pick(tags.ogTitle, [
      [p.openGraph?.title, 'page', 'Open Graph title'],
      [p.metaTitle, 'page', 'Meta title'],
      [page?.title, 'page', 'Page title'],
      [s.openGraph?.title, 'site', 'Site settings'],
      [s.metaTitle, 'site', 'Site settings, meta title']
    ]),
    ogDescription: pick(tags.ogDescription, [
      [p.openGraph?.description, 'page', 'Open Graph description'],
      [p.metaDescription, 'page', 'Meta description'],
      [s.openGraph?.description, 'site', 'Site settings'],
      [s.metaDescription, 'site', 'Site settings, meta description']
    ]),
    ogImage: pick(tags.ogImage, [
      [img(p.openGraph?.image), 'page', 'Share image'],
      [shareImageUrl(page?.metadata?.slug), 'generated', 'Generated card'],
      [img(s.openGraph?.image), 'site', 'Site settings']
    ]),
    ogSiteName: pick(tags.ogSiteName, [
      [p.openGraph?.siteName, 'page', 'Site name'],
      [s.openGraph?.siteName, 'site', 'Site settings']
    ])
  };
}

// Stands in for the generated card until the page has a published version to draw it from.
const UNPUBLISHED_CARD = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0f182d"/><text x="600" y="315" fill="#eaf6ff" fill-opacity="0.7" font-family="sans-serif" font-size="40" text-anchor="middle" dominant-baseline="middle">Generated card appears after publishing</text></svg>'
)}`;

// What the page ships when shared: its tags, where each came from, and the winning image's facts.
// `published` says whether the page has a published version for the generated card to draw.
export function sharePreviewOf(
  page,
  site,
  themeColor,
  { published = true } = {}
) {
  const tags = shareTags(resolveMetadata(page, site), themeColor);
  const image =
    [...(page?.shareImages ?? []), ...(site?.shareImages ?? [])].find(
      (asset) => asset?.url && asset.url === tags.ogImage
    ) ??
    // The generated card, drawn from the published page; its size is only known once drawn.
    (tags.ogImage === shareImageUrl(page?.metadata?.slug) ? SHARE_IMAGE : null);
  const sources = sourcesOf(page, site, tags);
  const generated = sources.ogImage.kind === 'generated';
  return {
    template: templateSlugs.includes(page?.metadata?.slug),
    tags,
    sources,
    generated: generated && (published ? 'published' : 'unpublished'),
    image: generated && !published ? UNPUBLISHED_CARD : tags.ogImage,
    images: {
      width: image?.width ?? null,
      height: image?.height ?? null,
      size: image?.size ?? null
    }
  };
}

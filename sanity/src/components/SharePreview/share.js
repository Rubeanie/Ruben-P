import { resolveMetadata } from '@/lib/resolveMetadata';
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
      [s.metaTitle, 'site', 'Site settings']
    ]),
    description: pick(tags.description, [
      [p.metaDescription, 'page', 'Meta description'],
      [s.metaDescription, 'site', 'Site settings']
    ]),
    ogTitle: pick(tags.ogTitle, [
      [p.openGraph?.title, 'page', 'Open Graph title'],
      [s.openGraph?.title, 'site', 'Site settings'],
      [p.metaTitle, 'page', 'Meta title'],
      [s.metaTitle, 'site', 'Site settings, meta title']
    ]),
    ogDescription: pick(tags.ogDescription, [
      [p.openGraph?.description, 'page', 'Open Graph description'],
      [s.openGraph?.description, 'site', 'Site settings'],
      [p.metaDescription, 'page', 'Meta description'],
      [s.metaDescription, 'site', 'Site settings, meta description']
    ]),
    ogImage: pick(tags.ogImage, [
      [img(p.openGraph?.image), 'page', 'Share image'],
      [img(page?.cover), 'cover', 'Post cover'],
      [img(s.openGraph?.image), 'site', 'Site settings']
    ]),
    ogSiteName: pick(tags.ogSiteName, [
      [p.openGraph?.siteName, 'page', 'Site name'],
      [s.openGraph?.siteName, 'site', 'Site settings']
    ])
  };
}

// What the page ships when shared: its tags, where each came from, and the winning image's facts.
export function sharePreviewOf(page, site, themeColor) {
  const tags = shareTags(resolveMetadata(page, site), themeColor);
  const image = [
    ...(page?.shareImages ?? []),
    ...(site?.shareImages ?? [])
  ].find((asset) => asset?.url && asset.url === tags.ogImage);
  return {
    template: templateSlugs.includes(page?.metadata?.slug),
    tags,
    sources: sourcesOf(page, site, tags),
    images: {
      width: image?.width ?? null,
      height: image?.height ?? null,
      size: image?.size ?? null
    }
  };
}

import { stegaClean } from '@sanity/client/stega';
import processUrl, { slugOf } from '@/lib/processUrl';
import { isPagePath } from '@/lib/slug';
import { baseUrl } from '@/lib/env';
import { FEED_PATH } from '@/lib/feed';
import { withDefaults } from '@/lib/metadataDefaults';
import { SHARE_IMAGE } from '@/lib/shareImage/layout';
import { shareImageUrl } from '@/lib/shareImage/url';

// The RSS feed, advertised in every page head.
export const feedTypes = { 'application/rss+xml': FEED_PATH };

const getMetaObjects = (tags) =>
  tags.reduce((mergedObject, tag) => {
    const metaTag = getMetaAttribute(tag?.metaAttributes);
    return metaTag ? { ...mergedObject, ...metaTag } : mergedObject;
  }, {});

const resolveImage = (image) => image?.asset?.url ?? '';

const getMetaAttribute = (attrs) =>
  attrs?.filter(Boolean).reduce(
    (obj, i) => ({
      ...obj,
      [i?.attributeKey]:
        i.attributeType === 'image'
          ? resolveImage(i?.attributeValueImage)
          : i.attributeValueString
    }),
    {}
  );

// Next drops the trailing slash of a bare origin; doing it here keeps the object equal to the head.
const bare = (url) => url.replace(/^(https?:\/\/[^/]+)\/$/, '$1');

// A hand-set share image wins; any other page gets its generated card, which draws its cover or hero.
function shareImages(pageSeo, og, path) {
  const handSet = pageSeo.openGraph?.image?.asset?.url;
  if (handSet) return [{ url: handSet }];
  if (isPagePath(path)) return [{ url: shareImageUrl(path), ...SHARE_IMAGE }];
  if (og?.image?.asset?.url) return [{ url: og.image.asset.url }];
  return [];
}

// Every tag is spelled out, including what Next would otherwise inherit, so the Studio
// preview can read the returned object as the page's head.
export function resolveMetadata(page, site) {
  const url = bare(processUrl(page));

  const siteKeywords = site?.seo?.seoKeywords || [];
  const pageSeo = page?.metadata?.seo || {};
  const { seoKeywords } = pageSeo;
  // The document's own title, e.g. "About"; stands between its meta title and the site's.
  const pageTitle = stegaClean(page?.title) || '';

  // GROQ projects an absent field as null, so withDefaults falls back with `??`.
  const { additionalMetaTags, metaDescription, nofollowAttributes } =
    withDefaults(pageSeo, site?.seo);
  const title = pageSeo.metaTitle || pageTitle || site?.seo?.metaTitle || '';
  const description = metaDescription || '';

  // Twitter and Open Graph fall back to the site field by field.
  const twitter = withDefaults(pageSeo.twitter, site?.seo?.twitter);

  const safeKeywords = Array.isArray(seoKeywords) ? seoKeywords : [];
  const combinedKeywords = [...siteKeywords, ...safeKeywords];
  const tags = additionalMetaTags ? getMetaObjects(additionalMetaTags) : {};
  const path = slugOf(page);
  let og = withDefaults(pageSeo.openGraph, site?.seo?.openGraph);
  // A page's card ships even when neither the page nor the site sets any Open Graph.
  if (!og && isPagePath(path)) og = {};
  const images = shareImages(pageSeo, og, path);

  // A share preview always points at the page itself.
  const openGraph = og && {
    // Own Open Graph title, then own meta title, then the document's own title,
    // before either falls to the site's.
    title:
      pageSeo.openGraph?.title ||
      pageSeo.metaTitle ||
      pageTitle ||
      site?.seo?.openGraph?.title ||
      title ||
      undefined,
    // Same order as the title, one level shallower: no document-level description exists.
    description:
      pageSeo.openGraph?.description ||
      pageSeo.metaDescription ||
      site?.seo?.openGraph?.description ||
      description ||
      undefined,
    siteName: og.siteName,
    url,
    images
  };

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    twitter: {
      title: openGraph?.title || title || undefined,
      description: openGraph?.description || description || undefined,
      images: openGraph?.images ?? [],
      creator: twitter?.handle || twitter?.creator,
      site: twitter?.site,
      // Unset means the large card when there is an image; Next alone would ship summary.
      card:
        twitter?.cardType ||
        (openGraph?.images?.length ? 'summary_large_image' : 'summary')
    },
    robots: {
      index: !nofollowAttributes,
      follow: !nofollowAttributes
    },
    openGraph,
    alternates: {
      canonical: url,
      types: feedTypes
    },
    keywords: combinedKeywords.join(', '),
    other: tags
  };
}

// Only these two heroes tint the browser bar; the page route and the share preview share the rule.
export function heroThemeImage(page) {
  const hero = page?.modules?.[0];
  return (
    (hero?._type === 'hero' && hero.bgImage?.asset?.url) ||
    (hero?._type === 'hero.saas' && hero.image?.asset?.url) ||
    null
  );
}

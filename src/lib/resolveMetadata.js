import { stegaClean } from '@sanity/client/stega';
import processUrl, { slugOf } from '@/lib/processUrl';
import { isPagePath } from '@/lib/slug';
import { baseUrl } from '@/lib/env';
import { firstModule } from '@/lib/modules';
import { stillOf } from '@/lib/imageBlock';
import { heroPhoto } from '@/lib/heroPhotos';
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

const getMetaAttribute = (attrs) =>
  attrs?.filter(Boolean).reduce(
    (obj, i) => ({
      ...obj,
      [i?.attributeKey]:
        i.attributeType === 'image'
          ? (stillOf(i?.attributeValueImage) ?? '')
          : i.attributeValueString
    }),
    {}
  );

// Next drops the trailing slash of a bare origin; doing it here keeps the object equal to the head.
const bare = (url) => url.replace(/^(https?:\/\/[^/]+)\/$/, '$1');

// A hand-set share image wins; any other page gets its generated card, which draws its cover or hero.
function shareImages(pageSeo, path) {
  const handSet = stillOf(pageSeo.openGraph?.image);
  if (handSet) return [{ url: handSet }];
  if (isPagePath(path)) return [{ url: shareImageUrl(path), ...SHARE_IMAGE }];
  return [];
}

// Every tag is spelled out, including what Next would otherwise inherit, so the Studio
// preview can read the returned object as the page's head.
export function resolveMetadata(page, site) {
  const url = bare(processUrl(page));

  const pageSeo = page?.metadata?.seo || {};
  // The document's own title, e.g. "About"; follows its meta title.
  const pageTitle = stegaClean(page?.title) || '';

  // GROQ projects an absent field as null, so withDefaults falls back with `??`.
  const { additionalMetaTags, metaDescription, nofollowAttributes } =
    withDefaults(pageSeo, site?.seo);
  const title = pageSeo.metaTitle || pageTitle || '';
  // A post's summary comes after the page's own description, before the site's.
  const description =
    pageSeo.metaDescription || page?.summary || metaDescription || '';

  // Twitter and Open Graph fall back to the site field by field.
  const twitter = withDefaults(pageSeo.twitter, site?.seo?.twitter);

  const tags = additionalMetaTags ? getMetaObjects(additionalMetaTags) : {};
  const path = slugOf(page);
  // A page's card ships even when neither the page nor the site sets any Open Graph.
  const hasOg =
    withDefaults(pageSeo.openGraph, site?.seo?.openGraph) || isPagePath(path);
  const images = shareImages(pageSeo, path);

  // A share preview always points at the page itself.
  const openGraph = hasOg
    ? {
        // Own Open Graph title, then own meta title, then the document's own title.
        title: pageSeo.openGraph?.title || title || undefined,
        // Its own description, then the page's meta description and summary, then the site's.
        description:
          pageSeo.openGraph?.description ||
          pageSeo.metaDescription ||
          page?.summary ||
          site?.seo?.openGraph?.description ||
          description ||
          undefined,
        // Only Site settings names the site, falling back to its title.
        siteName: site?.seo?.openGraph?.siteName || site?.title || undefined,
        url,
        images
      }
    : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    twitter: {
      title: openGraph?.title || title || undefined,
      description: openGraph?.description || description || undefined,
      images: openGraph?.images ?? [],
      creator: twitter?.handle,
      site: twitter?.site,
      // The generated card is built for the large layout; Next alone would ship summary.
      card: 'summary_large_image'
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
    // The page's one focus keyphrase; Google ignores the tag, others may glance at it.
    keywords: stegaClean(pageSeo.focusKeyphrase) || undefined,
    other: tags
  };
}

// Only these two heroes tint the browser bar; the page route and the share preview share the rule.
// Its still: a clip's colours are its Start frame's, as the hero draws them.
export function heroThemeImage(page) {
  const hero = firstModule(page?.modules);
  return (
    (['hero', 'hero.saas'].includes(hero?._type) && stillOf(heroPhoto(hero))) ||
    null
  );
}

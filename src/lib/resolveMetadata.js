import processUrl from '@/lib/processUrl';
import { baseUrl } from '@/lib/env';
import { withDefaults } from '@/lib/metadataDefaults';

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

// Every tag is spelled out, including what Next would otherwise inherit, so the Studio
// preview can read the returned object as the page's head.
export function resolveMetadata(page, site) {
  const url = bare(processUrl(page));

  const siteKeywords = site?.seo?.seoKeywords || [];
  const pageSeo = page?.metadata?.seo || {};
  const { seoKeywords } = pageSeo;

  // GROQ projects an absent field as null, so withDefaults falls back with `??`.
  const { additionalMetaTags, metaDescription, metaTitle, nofollowAttributes } =
    withDefaults(pageSeo, site?.seo);
  const title = metaTitle || '';
  const description = metaDescription || '';

  // Twitter and Open Graph fall back to the site field by field.
  const twitter = withDefaults(pageSeo.twitter, site?.seo?.twitter);

  const safeKeywords = Array.isArray(seoKeywords) ? seoKeywords : [];
  const combinedKeywords = [...siteKeywords, ...safeKeywords];
  const tags = additionalMetaTags ? getMetaObjects(additionalMetaTags) : {};
  const openGraphData = withDefaults(pageSeo.openGraph, site?.seo?.openGraph);
  // Posts rarely get a dedicated share image; the cover stands in, ahead of the site default.
  const og =
    page?.cover?.asset?.url && !pageSeo.openGraph?.image?.asset?.url
      ? { ...openGraphData, image: page.cover }
      : openGraphData;
  const images = og?.image?.asset?.url ? [{ url: og.image.asset.url }] : [];

  // A share preview always points at the page itself.
  const openGraph = og && {
    title: og.title || title || undefined,
    description: og.description || description || undefined,
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
      canonical: url
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

import { getSite } from '@/lib/sanity/queries';
import processUrl from '@/lib/processUrl';
import { baseUrl } from '@/lib/env';
import { withDefaults } from '@/lib/metadataDefaults';

const getOpenGraph = ({ _type, description, image, title, siteName, url }) => ({
  _type,
  description,
  siteName,
  url,
  title,
  images: [{ url: image?.asset?.url || '' }]
});

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

export async function processMetadata(page) {
  const site = await getSite();
  const url = processUrl(page);

  const siteKeywords = site.seo?.seoKeywords || [];
  const pageSeo = page?.metadata?.seo || {};
  const { seoKeywords } = pageSeo;

  // GROQ projects an absent field as null, so withDefaults falls back with `??`.
  const { additionalMetaTags, metaDescription, metaTitle, nofollowAttributes } =
    withDefaults(pageSeo, site.seo);

  // Twitter and Open Graph fall back to the site field by field.
  const twitter = withDefaults(pageSeo.twitter, site.seo?.twitter);

  const safeKeywords = Array.isArray(seoKeywords) ? seoKeywords : [];
  const combinedKeywords = [...siteKeywords, ...safeKeywords];
  const tags = additionalMetaTags ? getMetaObjects(additionalMetaTags) : {};
  const openGraphData = withDefaults(pageSeo.openGraph, site.seo?.openGraph);
  // Posts rarely get a dedicated share image; the cover stands in, ahead of the site default.
  const withCover =
    page?.cover?.asset?.url && !pageSeo.openGraph?.image?.asset?.url
      ? { ...openGraphData, image: page.cover }
      : openGraphData;
  // A share preview always points at the page itself.
  const openGraph = withCover ? getOpenGraph({ ...withCover, url }) : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: metaTitle || '',
    description: metaDescription || '',
    twitter: {
      creator: twitter?.handle || twitter?.creator,
      site: twitter?.site,
      card: twitter?.cardType
    },
    robots: {
      index: !nofollowAttributes,
      follow: !nofollowAttributes
    },
    openGraph,
    alternates: {
      canonical: url || ''
    },
    keywords: combinedKeywords.join(', '),
    other: tags
  };
}

import { getSite } from '@/lib/sanity/queries';
import processUrl from '@/lib/processUrl';
import { baseUrl } from '@/lib/env';

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
    return metaTag ? {...mergedObject, ...metaTag} : mergedObject;
  }, {});

const resolveImage = (image) => image?.asset?.url ?? '';

const getMetaAttribute = (attrs) =>
  attrs?.reduce(
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

  const {
    additionalMetaTags = site.seo?.additionalMetaTags,
    metaDescription = site.seo?.metaDescription,
    metaTitle = site.seo?.metaTitle,
    twitter = site.seo?.twitter,
    nofollowAttributes = site.seo?.nofollowAttributes,
    seoKeywords
  } = page?.metadata.seo || {};

  const safeKeywords = Array.isArray(seoKeywords) ? seoKeywords : [];
  const combinedKeywords = [...siteKeywords, ...safeKeywords];
  const tags = additionalMetaTags ? getMetaObjects(additionalMetaTags) : {};
  const openGraphData = page?.metadata.seo?.openGraph || site.seo?.openGraph;
  const openGraph = openGraphData ? getOpenGraph(openGraphData) : undefined;

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
      canonical: url || '',
      types: {
        'application/rss+xml': '/blog/rss.xml'
      }
    },
    keywords: combinedKeywords.join(', '),
    other: tags
  };
}

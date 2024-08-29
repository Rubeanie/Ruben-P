import { getSite } from '@/lib/sanity/queries';
import processUrl from '@/lib/processUrl';
import { baseUrl } from '@/lib/env';

export const getOpenGraph = (args) => {
  const { description, image, title, _type, siteName, url } = args;
  const getImage = image ? resolveImage(image) : null;
  return {
    _type,
    description,
    siteName,
    url,
    title,
    images: [{ url: getImage ?? '' }]
  };
};

export const getMetaObjects = (tags) => {
  return tags.reduce((mergedObject, tag) => {
    const metaTag = getMetaAttribute(tag?.metaAttributes);
    if (metaTag) {
      Object.entries(metaTag).forEach(([key, value]) => {
        mergedObject[key] = value;
      });
    }
    return mergedObject;
  }, {});
};

export const resolveImage = (image) => {
  return image?.asset?.url ?? '';
};

export const getMetaAttribute = (attrs) => {
  if (!attrs) return null;
  return attrs.reduce((obj, i) => {
    obj[i?.attributeKey] =
      i.attributeType === 'image'
        ? resolveImage(i?.attributeValueImage)
        : i.attributeValueString;
    return obj;
  }, {});
};

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
    seoKeywords = []
  } = page?.metadata.seo || {};

  const combinedKeywords = siteKeywords.concat(seoKeywords);

  console.log(nofollowAttributes);

  const tags = additionalMetaTags ? getMetaObjects(additionalMetaTags) : {};

  const openGraphData = page?.metadata.seo?.openGraph || site.seo?.openGraph;
  const openGraph = openGraphData ? getOpenGraph(openGraphData) : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: metaTitle ?? '',
    description: metaDescription ?? '',
    twitter: {
      creator: twitter?.handle ?? twitter?.creator,
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
    keywords:
      combinedKeywords && combinedKeywords.length > 0
        ? combinedKeywords.join(', ')
        : '',
    other: tags
  };
}

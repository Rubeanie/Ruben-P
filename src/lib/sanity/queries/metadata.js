import { groq } from '../fetch';

const imageFieldsQuery = groq`
  _type,
  crop{
    _type,
    right,
    top,
    left,
    bottom
  },
  hotspot{
    _type,
    x,
    y,
    height,
    width,
  },
  asset->{...}
`;

const metaAttributesQuery = groq`
  _type,
  attributeValueString,
  attributeType,
  attributeKey,
  attributeValueImage{
    ${imageFieldsQuery}
  }
`;

const openGraphQuery = groq`
  _type,
  siteName,
  url,
  description,
  title,
  image{
    ${imageFieldsQuery}
  }
`;

const twitterQuery = groq`
  _type,
  site,
  creator,
  cardType,
  handle
`;

const seoFieldsQuery = groq`
  _type,
  metaTitle,
  nofollowAttributes,
  seoKeywords,
  metaDescription,
  openGraph{
    ${openGraphQuery}
  },
  twitter{
    ${twitterQuery}
  },
  additionalMetaTags[]{
    _type,
    metaAttributes[]{
      ${metaAttributesQuery}
    }
  }
`;

export const seoQuery = groq`seo{
  ${seoFieldsQuery}
}`;

export const metadataQuery = groq`metadata{
  _type,
  "slug":slug.current,
  ${seoQuery}
}`;
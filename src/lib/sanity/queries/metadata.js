import { groq } from '../fetch';

export const imageFields = groq`
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

export const metaAttributesQuery = groq`
  _type,
  attributeValueString,
  attributeType,
  attributeKey,
  attributeValueImage{
    ${imageFields}
  }
`;

export const openGraphQuery = groq`
  _type,
  siteName,
  url,
  description,
  title,
  image{
    ${imageFields}
  }
`;

export const twitterQuery = groq`
  _type,
  site,
  creator,
  cardType,
  handle
`;

export const seofields = groq`
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

export const seo = groq`seo{
  ${seofields}
}`;

export const metadata = groq`metadata{
  _type,
  "slug":slug.current,
  ${seo}
}`;
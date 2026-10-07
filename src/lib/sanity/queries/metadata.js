import groq from 'groq';
import { cloudinaryStillQuery } from './fragments/cloudinary';

const metaAttributesQuery = groq`
  _type,
  attributeValueString,
  attributeType,
  attributeKey,
  attributeValueImage{ ${cloudinaryStillQuery} }
`;

const openGraphQuery = groq`
  _type,
  siteName,
  description,
  title,
  // Only what the still needs: og:image carries one URL, and internal links
  // project this whole query for each page they point to.
  image{ ${cloudinaryStillQuery} }
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
  focusKeyphrase,
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

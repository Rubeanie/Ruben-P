import groq from 'groq';
import { cloudinaryStillQuery } from './fragments/cloudinary';

const openGraphQuery = groq`
  siteName,
  description,
  title,
  // Only what the still needs: og:image carries one URL.
  image{ ${cloudinaryStillQuery} }
`;

const twitterQuery = groq`
  site,
  handle
`;

const seoFieldsQuery = groq`
  metaTitle,
  nofollowAttributes,
  focusKeyphrase,
  metaDescription,
  openGraph{
    ${openGraphQuery}
  },
  twitter{
    ${twitterQuery}
  }
`;

export const seoQuery = groq`seo{
  ${seoFieldsQuery}
}`;

export const metadataQuery = groq`metadata{
  "slug":slug.current,
  ${seoQuery}
}`;

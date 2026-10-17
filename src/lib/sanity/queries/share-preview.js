import groq from 'groq';
import { metadataQuery, seoQuery } from './metadata';
import { postCardQuery } from './fragments/post-card';
import { cloudinaryStillQuery } from './fragments/cloudinary';
import { sharePhotosQuery, shareModulesQuery } from './share-image';

// A share image as far as its still, which the head ships, plus the asset's
// file size (sharePreviewOf keeps it only for an image that is its own still).
const shareImageFacts = groq`{ ${cloudinaryStillQuery}, "bytes": asset.bytes }`;

// The fields the page route resolves metadata from, plus the facts of every candidate share image.
export const sharePageQuery = groq`*[_id == $id][0]{
  _type,
  ${postCardQuery},
  ${shareModulesQuery},
  ${metadataQuery},
  ${sharePhotosQuery},
  "shareImages": [metadata.seo.openGraph.image${shareImageFacts}]
}`;

export const shareSiteQuery = groq`*[_type == 'site'][0]{
  title,
  ${seoQuery}
}`;

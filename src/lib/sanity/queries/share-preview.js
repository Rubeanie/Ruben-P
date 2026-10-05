import groq from 'groq';
import { metadataQuery, seoQuery } from './metadata';
import { postCardQuery } from './fragments/post-card';
import { sharePhotosQuery } from './share-image';

const assetFacts = groq`
  url,
  size,
  mimeType,
  "width": metadata.dimensions.width,
  "height": metadata.dimensions.height
`;

// The fields the page route resolves metadata from, plus the facts of every candidate share image.
export const sharePageQuery = groq`*[_id == $id][0]{
  _type,
  ${postCardQuery},
  "modules": modules[0...4]{ _type, html{ code }, bgImage{ asset->{ url } }, image{ asset->{ url } } },
  ${metadataQuery},
  ${sharePhotosQuery},
  "shareImages": [metadata.seo.openGraph.image.asset->{ ${assetFacts} }]
}`;

export const shareSiteQuery = groq`*[_type == 'site'][0]{
  ${seoQuery},
  "shareImages": [seo.openGraph.image.asset->{ ${assetFacts} }]
}`;

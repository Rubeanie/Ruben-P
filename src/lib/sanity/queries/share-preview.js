import groq from 'groq';
import { metadataQuery, seoQuery } from './metadata';
import { postCardQuery } from './fragments/post-card';

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
  "modules": modules[0...1]{ _type, bgImage{ asset->{ url } }, image{ asset->{ url } } },
  ${metadataQuery},
  "shareImages": [metadata.seo.openGraph.image.asset->{ ${assetFacts} }]
}`;

export const shareSiteQuery = groq`*[_type == 'site'][0]{
  ${seoQuery},
  "shareImages": [seo.openGraph.image.asset->{ ${assetFacts} }]
}`;

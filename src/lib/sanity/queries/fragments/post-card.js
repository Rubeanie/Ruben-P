import groq from 'groq';
import { categoryQuery } from './category';
import { cloudinaryImageQuery } from './cloudinary';

// Everything a tile needs; the post page projects the same fields. A filter after a
// dereferenced projection nulls every element (verified against the API, 23 Sep), so
// missing references are dropped with array::compact instead.
export const postCardQuery = groq`
  _id,
  title,
  summary,
  publishDate,
  featured,
  "slug": metadata.slug.current,
  "categories": array::compact(categories[]->{ ${categoryQuery} }),
  cover { ${cloudinaryImageQuery} }
`;

import { groq, fetchSanity } from '../fetch';
import { categoryQuery } from './fragments/category';

// Everything a tile needs; the post page projects the same fields.
export const postCardQuery = groq`
  _id,
  title,
  summary,
  publishDate,
  featured,
  "slug": metadata.slug.current,
  categories[]->{ ${categoryQuery} }[defined(_id)],
  cover {
    asset->{
      _id,
      url,
      metadata { dimensions { width, height }, palette { dominant { background } } }
    },
    hotspot { x, y, width, height },
    crop { top, bottom, left, right }
  }
`;

// Every post, newest first, fetched once per build and shared by every module that lists posts.
// Featured posts sit wherever their date puts them; a row that wants them first sorts itself.
export const postIndexQuery = groq`
  *[_type == 'page.post' && defined(metadata.slug.current)]
    | order(publishDate desc) {
    ${postCardQuery}
  }
`;

export async function getPostIndex() {
  return (await fetchSanity(postIndexQuery, { tags: ['posts'] })) ?? [];
}

import { groq, fetchSanity } from '../fetch';
import { categoryQuery } from './fragments/category';
import { orderCategories } from '@/lib/posts';

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

// Every post, newest first, fetched once per build and shared by every module that lists posts,
// plus the site's category order. Featured posts sit wherever their date puts them; a row that
// wants them first sorts itself.
export const postIndexQuery = groq`{
  'posts': *[_type == 'page.post' && defined(metadata.slug.current)]
    | order(publishDate desc) {
    ${postCardQuery}
  },
  'categories': *[_type == 'site'][0].postCategories[]->{ ${categoryQuery} }[defined(_id)]
}`;

// Each post's categories come back in the site order, so tiles never sort them again.
export async function getPostIndex() {
  const index = await fetchSanity(postIndexQuery, { tags: ['posts', 'site'] });
  const categories = index?.categories ?? [];
  const posts = (index?.posts ?? []).map((post) => ({
    ...post,
    categories: orderCategories(post.categories ?? [], categories)
  }));
  return { posts, categories };
}

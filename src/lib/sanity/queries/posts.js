import { groq, fetchSanity } from '../fetch';
import { categoryQuery } from './fragments/category';
import { postCardQuery } from './fragments/post-card';
import { orderCategories } from '@/lib/posts';

// Every post, newest first, fetched once per build and shared by every module that lists posts,
// plus the site's category order. Featured posts sit wherever their date puts them; a row that
// wants them first sorts itself.
export const postIndexQuery = groq`{
  'posts': *[_type == 'page.post' && defined(metadata.slug.current)]
    | order(publishDate desc) {
    ${postCardQuery}
  },
  'categories': array::compact(*[_type == 'site'][0].postCategories[]->{ ${categoryQuery} })
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

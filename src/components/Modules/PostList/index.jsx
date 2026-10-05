import { getPostIndex } from '@/lib/sanity/queries/posts';
import uid from '@/lib/uid';
import { Bento } from '@/components/lazy';

// The site's category order, minus any category without a post; a category left off the site list is never a chip.
function chipCategories(posts, categories) {
  const found = new Set();
  for (const post of posts)
    for (const category of post.categories ?? []) found.add(category._id);
  // A repeated reference in the site list would repeat a chip, so each id passes once.
  return categories.filter((c) => found.delete(c._id));
}

export default async function PostList({ displayFilters, ...props }) {
  const { posts, categories } = await getPostIndex();
  if (!posts.length) return null;
  const filters = displayFilters ? chipCategories(posts, categories) : null;
  return <Bento id={uid(props)} posts={posts} filters={filters} />;
}

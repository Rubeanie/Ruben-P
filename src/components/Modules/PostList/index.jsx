import { byCategory } from '@/lib/posts';
import { getPostIndex } from '@/lib/sanity/queries/posts';
import Bento from './Bento';

// Chips in the editor's order when set, otherwise every category found on the
// posts in title order. A category without a post is never a chip.
function chipCategories(posts, predefined) {
  const found = new Map();
  for (const post of posts)
    for (const category of post.categories ?? [])
      if (category?._id && !found.has(category._id))
        found.set(category._id, category);
  if (predefined?.length) {
    const seen = new Set();
    return predefined.filter((c) => {
      if (!c?._id || seen.has(c._id) || !found.has(c._id)) return false;
      seen.add(c._id);
      return true;
    });
  }
  return [...found.values()].sort(byCategory);
}

export default async function PostList({ displayFilters, predefinedFilters }) {
  const posts = await getPostIndex();
  if (!posts.length) return null;
  const filters = displayFilters
    ? chipCategories(posts, predefinedFilters)
    : null;
  return <Bento posts={posts} filters={filters} />;
}

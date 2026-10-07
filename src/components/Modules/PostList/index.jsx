import { Suspense } from 'react';
import { getPostIndex } from '@/lib/sanity/queries/posts';
import { stegaClean } from '@sanity/client/stega';
import { introImages } from '@/lib/introImages';
import IntentImages from '@/components/IntentImages';
import uid from '@/lib/uid';
import { PAGE_SIZE } from '@/lib/bento';
import { Bento } from '@/components/lazy';

// The site's category order, minus any category without a post; a category left off the site list is never a chip.
function chipCategories(posts, categories) {
  const found = new Set();
  for (const post of posts)
    for (const category of post.categories ?? []) found.add(category._id);
  // A repeated reference in the site list would repeat a chip, so each id passes once.
  return categories.filter((c) => found.delete(c._id));
}

// Only the first page of tiles is on screen to be hovered. Streamed so the
// lookup never holds up the list.
async function PostIntent({ posts }) {
  const hrefs = posts.slice(0, PAGE_SIZE).map((post) => stegaClean(post.slug));
  return <IntentImages images={await introImages(hrefs)} />;
}

export default async function PostList({ displayFilters, ...props }) {
  const { posts, categories } = await getPostIndex();
  if (!posts.length) return null;
  const filters = displayFilters ? chipCategories(posts, categories) : null;
  return (
    <>
      <Bento id={uid(props)} posts={posts} filters={filters} />
      <Suspense fallback={null}>
        <PostIntent posts={posts} />
      </Suspense>
    </>
  );
}

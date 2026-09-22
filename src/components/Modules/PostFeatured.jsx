import { tileBands } from '@/lib/bento';
import { featuredFirst, relatedPosts } from '@/lib/posts';
import { getPostIndex } from '@/lib/sanity/queries/posts';
import Tile from './PostList/Tile';
import styles from '@/styles/components/PostFeatured.module.scss';

// Featured posts first, newest after; under a post it becomes the related row instead.
export default async function PostFeatured({ limit, page }) {
  const { posts } = await getPostIndex();
  const onPost = page?._type === 'page.post';
  const shown = onPost
    ? relatedPosts(posts, page, limit)
    : featuredFirst(posts).slice(0, limit);
  if (!shown.length) return null;
  const bands = tileBands(shown);
  return (
    <section className={styles.section}>
      {onPost && <h2 className={styles.heading}>More like this</h2>}
      <div className={styles.row}>
        {shown.map((post, i) => (
          <Tile key={post._id} post={post} band={bands[i]} wide />
        ))}
      </div>
    </section>
  );
}

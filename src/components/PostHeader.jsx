import Image from 'next/image';
import { stegaClean } from '@sanity/client/stega';
import { imageBuilder } from '@/lib/sanity/image';
import { formatDate, inkFor } from '@/lib/posts';
import styles from '@/styles/components/PostHeader.module.scss';

// Dimensions can be missing on an asset; a 3:2 guess keeps next/image happy until the file corrects it.
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 800;

// The reserved box must match the cropped aspect (crop sides are fractions) or the page shifts on load.
function reserve(dimensions, crop) {
  const { width, height } = dimensions ?? {};
  if (!width || !height)
    return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
  if (!crop) return { width, height };
  return {
    width: Math.round(width * (1 - (crop.left ?? 0) - (crop.right ?? 0))),
    height: Math.round(height * (1 - (crop.top ?? 0) - (crop.bottom ?? 0)))
  };
}

export default function PostHeader({ post }) {
  const cleanDate = post.publishDate ? stegaClean(post.publishDate) : null;
  const date = cleanDate ? formatDate(cleanDate) : '';
  // The URL builder reads ids and the crop rect, so the whole cover is cleaned.
  const cover = stegaClean(post.cover);
  const box = reserve(cover?.asset?.metadata?.dimensions, cover?.crop);
  const dominant = cover?.asset?.metadata?.palette?.dominant?.background;
  const categories = post.categories ?? [];
  // Built from the cover object, not the raw url, so the editor's crop applies.
  const src = cover?.asset?.url
    ? imageBuilder.image(cover).width(1600).fit('max').auto('format').url()
    : null;

  return (
    <>
      <header className={styles.header}>
        <h1>{post.title}</h1>
        {post.summary && <p className={styles.summary}>{post.summary}</p>}
        {(date || categories.length > 0) && (
          <div className={styles.meta}>
            {date && (
              <time className={styles.date} dateTime={cleanDate}>
                {date}
              </time>
            )}
            {categories.length > 0 && (
              <ul className={styles.categories} aria-label='Categories'>
                {categories.map((category) => {
                  const color = stegaClean(category.color?.hex);
                  return (
                    <li
                      key={category._id}
                      className={styles.chip}
                      style={color ? { '--chip': color } : undefined}
                      data-ink={color ? inkFor(color) : undefined}>
                      {category.title}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </header>
      {src && (
        <figure className={styles.cover} style={{ '--plate': dominant }}>
          <Image
            src={src}
            width={box.width}
            height={box.height}
            // The h1 already names the page, so the cover is decorative.
            alt=''
            priority
            sizes='(max-width: 43.75rem) 100vw, 65rem'
          />
        </figure>
      )}
    </>
  );
}

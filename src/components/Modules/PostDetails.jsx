import Image from 'next/image';
import { stegaClean } from '@sanity/client/stega';
import { imageBuilder } from '@/lib/sanity/image';
import { resolveLink } from '@/lib/processUrl';
import { formatDate, initials, inkFor, sameDay } from '@/lib/posts';
import styles from '@/styles/components/PostDetails.module.scss';

// Six discs is the ceiling; the stylesheet keys its hover rules on it.
const MAX_AUTHORS = 6;
// Rendered at 2rem; the CDN crop covers screens up to 5x.
const PHOTO_PX = 160;
const DISC_PX = 32;

function Sep() {
  return (
    <span className={styles.sep} aria-hidden='true'>
      ·
    </span>
  );
}

function Disc({ author }) {
  // The URL builder reads ids and the crop rect, so the whole photo is cleaned.
  const photo = stegaClean(author.photo);
  const src = photo?.asset?._id
    ? imageBuilder
        .image(photo)
        .width(PHOTO_PX)
        .height(PHOTO_PX)
        .fit('crop')
        .auto('format')
        .url()
    : null;
  return (
    <span className={styles.disc} aria-hidden='true'>
      {src ? (
        <Image
          className={styles.photo}
          src={src}
          width={DISC_PX}
          height={DISC_PX}
          // The name sits beside the disc.
          alt=''
          // The CDN URL is already the exact crop; a second resize would only add a hop.
          unoptimized
        />
      ) : (
        initials(stegaClean(author.name))
      )}
    </span>
  );
}

export default function PostDetails({
  authors: showAuthors,
  published,
  edited,
  categories: showCategories,
  page
}) {
  if (page?._type !== 'page.post') return null;

  const authors = showAuthors
    ? (page.authors ?? [])
        .slice(0, MAX_AUTHORS)
        .map((author) => ({ ...author, href: resolveLink(author.link) }))
    : [];
  const publishDate = stegaClean(page.publishDate);
  const publishedOn = published && publishDate ? publishDate : null;
  // An edit on the day of publishing is not worth a second date.
  const editedOn =
    edited && page._updatedAt && !sameDay(publishDate, page._updatedAt)
      ? page._updatedAt
      : null;
  const categories = showCategories ? (page.categories ?? []) : [];

  if (!authors.length && !publishedOn && !editedOn && !categories.length)
    return null;

  return (
    <section
      className={`${styles.details} ${authors.length ? styles.withAuthors : ''}`}>
      {authors.length > 0 && (
        <div className={styles.discs}>
          {authors.map((author, i) => {
            const Tag = author.href ? 'a' : 'span';
            return (
              <Tag
                key={author._id}
                className={styles.avatar}
                data-author={i + 1}
                href={author.href ?? undefined}
                aria-label={author.href ? stegaClean(author.name) : undefined}>
                <Disc author={author} />
              </Tag>
            );
          })}
        </div>
      )}
      <div className={styles.who}>
        {authors.length > 0 && (
          <>
            <span className={styles.role}>Written by</span>
            <span className={styles.nameLine}>
              {authors.map((author, i) => (
                <span key={author._id} className={styles.nameItem}>
                  {author.href ? (
                    <a
                      href={author.href}
                      className={`${styles.name} ${styles.nameLink}`}
                      data-author={i + 1}>
                      {author.name}
                    </a>
                  ) : (
                    <span className={styles.name} data-author={i + 1}>
                      {author.name}
                    </span>
                  )}
                  {i < authors.length - 1 && <Sep />}
                </span>
              ))}
            </span>
          </>
        )}
        {(publishedOn || editedOn) && (
          <span className={styles.when}>
            {publishedOn && (
              <time dateTime={publishedOn}>{formatDate(publishedOn)}</time>
            )}
            {publishedOn && editedOn && <Sep />}
            {editedOn && (
              <span>
                Edited <time dateTime={editedOn}>{formatDate(editedOn)}</time>
              </span>
            )}
          </span>
        )}
      </div>
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
    </section>
  );
}

import { stegaClean } from '@sanity/client/stega';
import { LuExternalLink } from 'react-icons/lu';
import { isSafeHref } from '@/lib/processUrl';
import styles from '@/styles/components/FigureCaption.module.scss';

// The caption's words, carrying the source link when there is one so the media
// itself is not a tab stop; null when there is neither. The media carousel
// sets these in its own caption row. Web links open in a new tab.
export function captionText({ caption, source }) {
  const href = stegaClean(source);
  // tel: and the like are safe hrefs but make no sense as a credit link.
  const email = /^mailto:/i.test(href);
  const linked =
    href && isSafeHref(href) && (email || /^(https?:|\/)/i.test(href));
  if (!linked) return caption || null;
  // An email link opens in place, with no external icon.
  if (email)
    return (
      <a href={href} className={styles.source}>
        {caption || 'Email'}
      </a>
    );
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={styles.source}>
      {caption || 'Source'}
      <LuExternalLink
        className={styles.sourceIcon}
        strokeWidth={1.75}
        aria-hidden='true'
      />
      <span className={styles.srOnly}>, opens in a new tab</span>
    </a>
  );
}

// Shared by every media figure (image, 3D scene) so one caption renders the same
// everywhere. Returns nothing when there is neither a caption nor a usable link.
export default function FigureCaption({ caption, source }) {
  const text = captionText({ caption, source });
  return text ? (
    <figcaption className={styles.caption}>{text}</figcaption>
  ) : null;
}

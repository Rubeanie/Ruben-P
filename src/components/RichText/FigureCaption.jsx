import { stegaClean } from '@sanity/client/stega';
import { LuExternalLink } from 'react-icons/lu';
import { isSafeHref } from '@/lib/processUrl';
import styles from '@/styles/components/FigureCaption.module.scss';

// Shared by every media figure (image, 3D scene) so one caption renders the same
// everywhere. Returns nothing when there is neither a caption nor a usable link.
export default function FigureCaption({ caption, source }) {
  const href = stegaClean(source);
  // mailto: and tel: are safe hrefs but make no sense as a credit link.
  const linked = href && isSafeHref(href) && /^(https?:|\/)/.test(href);

  if (linked)
    return (
      <figcaption className={styles.caption}>
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
      </figcaption>
    );

  return caption ? (
    <figcaption className={styles.caption}>{caption}</figcaption>
  ) : null;
}

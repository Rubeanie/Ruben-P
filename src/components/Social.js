import { brandInk } from '@/lib/brandInk';
import styles from '@/styles/components/Social.module.scss';

export default function Social({
  heading = 'heading',
  subheading = 'subheading',
  logo,
  color = 'var(--color-primary)'
}) {
  const ink = brandInk(color);
  return (
    <div
      className={styles.social}
      style={{ '--brand': color, '--brand-ink': ink }}>
      {logo && (
        <span className={styles.watermark} aria-hidden='true'>
          {logo}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.title}>{heading}</span>
        {subheading && <span className={styles.username}>{subheading}</span>}
      </span>
    </div>
  );
}

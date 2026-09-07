import styles from '@/styles/components/Social.module.scss';

// Near-black brands disappear against the dark card, so lift them towards a
// light neutral.
function brandInk(color) {
  if (!/^#[0-9a-f]{6}$/i.test(color || '')) return undefined;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.2
    ? `color-mix(in srgb, ${color} 25%, #d3d3d8)`
    : undefined;
}

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

import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import { resolveLink } from '@/lib/processUrl';
import styles from '@/styles/components/CTA.module.scss';

const variantClasses = {
  action: styles.action,
  'action-outline': styles.outline,
  ghost: styles.ghost,
  link: styles.link
};

export default function CTA({ link, variant }) {
  if (!link) return null;

  const href = resolveLink(link);
  if (!href) return null;

  const variantClass =
    variantClasses[stegaClean(variant)] || variantClasses.action;

  // Rendered text keeps its stega markers so Presentation overlays can target it.
  // label fallbacks resolve in linkQuery; href is the last resort.
  const text = link.label || href;

  return (
    <Link href={href} className={`${styles.cta} ${variantClass}`}>
      {text}
    </Link>
  );
}

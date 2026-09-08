import Link from 'next/link';
import { RubenP } from '@/utils/icons';
import { resolveLink } from '@/lib/processUrl';
import styles from '@/styles/components/Footer.module.scss';

export default function Footer({ menu }) {
  const links = (menu?.items ?? [])
    // an item still being added in the Studio can be null
    .filter(Boolean)
    .map((item) => ({
      key: item._key,
      label: item.label,
      href: resolveLink(item)
    }))
    .filter((link) => link.href);

  return (
    <footer className={styles.footer}>
      <span className={styles.mark} aria-hidden='true'>
        <RubenP />
      </span>
      <div className={styles.container}>
        {links.length > 0 && (
          <nav className={styles.links} aria-label='Footer'>
            {links.map((link) => (
              <Link key={link.key} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Ruben Panzich
        </p>
      </div>
    </footer>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RubenP } from '@/utils/icons';
import { Squeeze as Hamburger } from 'hamburger-react';
import { resolveLink } from '@/lib/processUrl';
import styles from '@/styles/components/Navbar.module.scss';

const Navbar = ({ menu }) => {
  const toLink = (item) =>
    item && {
      key: item._key ?? 'logo',
      label: item.label,
      href: resolveLink(item),
      cta: item.cta
    };
  // The bar shows the logo link as an icon; the dropdown lists it by label first.
  const home = toLink(menu?.logoLink);
  const links = (menu?.items ?? []).map(toLink).filter((link) => link.href);
  const linksRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // Close the menu on navigation, including browser back.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Compact mode when the links overflow their row. Fitting again closes the
  // menu, which only exists in compact mode.
  useEffect(() => {
    const links = linksRef.current;
    const observer = new ResizeObserver(() => {
      const overflowing = links.scrollWidth > links.clientWidth;
      setCompact(overflowing);
      if (!overflowing) setOpen(false);
    });
    observer.observe(links);
    return () => observer.disconnect();
  }, []);

  // Scroll lock, glass state and the footer tint all read these <html> attributes.
  useEffect(() => {
    document.documentElement.setAttribute('data-nav-dropdown', open);
  }, [open]);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    const onScroll = () =>
      document.documentElement.setAttribute(
        'data-nav-scrolled',
        window.scrollY > 100 ? 'true' : 'false'
      );
    onScroll(); // a refresh can land mid-page
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={styles.nav} data-compact={compact || undefined}>
      <div className={styles.container}>
        <Link href={home?.href ?? '/'} title={home?.label} onClick={close}>
          <RubenP />
        </Link>
        <div className={styles.links} ref={linksRef} inert={compact}>
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={link.cta ? styles.cta : undefined}>
              <p>{link.label}</p>
            </Link>
          ))}
        </div>
        {compact && (
          <Hamburger
            toggled={open}
            toggle={setOpen}
            size={30}
            duration={0.3}
            distance='sm'
            color='var(--color-primary)'
            easing='ease-out'
            rounded={true}
            label='Show menu'
          />
        )}
        <div className={styles.dropdown} inert={!open}>
          <div className={styles.menu}>
            {[home, ...links]
              .filter((link) => link?.href)
              .map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={close}
                  className={link.cta ? styles.cta : undefined}>
                  <p>{link.label}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

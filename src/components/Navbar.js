'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import { resolveLink } from '@/lib/processUrl';
import styles from '@/styles/components/Navbar.module.scss';

const Navbar = ({ menu, logo }) => {
  const toLink = (item) =>
    item && {
      key: item._key ?? 'logo',
      label: item.label,
      href: resolveLink(item)
    };
  // The bar shows the lead link on the logo; the dropdown lists it by label first.
  const lead = toLink(menu?.leadLink);
  // The optional call to action renders as a button after the links.
  const cta = toLink(menu?.cta);
  const links = [
    ...(menu?.items ?? []).map(toLink),
    cta && { ...cta, key: 'cta', cta: true }
  ].filter((link) => link?.href);
  const linksRef = useRef(null);
  const toggleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // Close the menu on navigation, including browser back.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Compact mode when the links overflow their row, published on <html> for the
  // styles. The layout's inline script sets it before first paint; this keeps
  // it current. Fitting again closes the menu, which only exists in compact mode.
  useEffect(() => {
    const links = linksRef.current;
    const observer = new ResizeObserver(() => {
      const overflowing = links.scrollWidth > links.clientWidth;
      document.documentElement.toggleAttribute('data-nav-compact', overflowing);
      if (!overflowing) setOpen(false);
    });
    // the row's own box only changes on resize; the links change with fonts and content
    for (const el of [links, ...links.children]) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll lock, glass state and the footer all read these <html> attributes.
  useEffect(() => {
    document.documentElement.setAttribute('data-nav-dropdown', open);
    // the open menu covers the page and the band, so keep keyboard focus in the nav
    for (const el of document.querySelectorAll('body > :not(nav, script)'))
      el.toggleAttribute('inert', open);
  }, [open]);

  // Escape closes the menu and hands focus back to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
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
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href={lead?.href ?? '/'} title={lead?.label} onClick={close}>
          <Logo svg={logo} />
        </Link>
        <div className={styles.links} ref={linksRef} data-nav-links>
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={link.cta ? styles.cta : undefined}>
              <p>{link.label}</p>
            </Link>
          ))}
        </div>
        <button
          ref={toggleRef}
          type='button'
          className={styles.burger}
          aria-expanded={open}
          aria-controls='nav-menu'
          aria-label='Show menu'
          onClick={() => setOpen(!open)}
        />
        <div id='nav-menu' className={styles.dropdown} inert={!open}>
          <div className={styles.menu}>
            {[lead, ...links]
              .filter((link) => link?.href)
              .map((link, i) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={close}
                  style={{ '--i': i }}
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

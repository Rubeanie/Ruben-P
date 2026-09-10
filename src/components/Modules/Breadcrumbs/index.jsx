import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import { baseUrl } from '@/lib/env';
import { resolveLink } from '@/lib/processUrl';
import { ancestorPaths, pagePath } from '@/lib/breadcrumbs';
import { fetchSanity } from '@/lib/sanity/fetch';
import { getSite } from '@/lib/sanity/queries';
import { breadcrumbAncestorsQuery } from '@/lib/sanity/queries/modules/breadcrumbs';
import { sanitizeSvg } from '@/lib/sanitizeSvg';
import Logo from '@/components/Logo';
import styles from '@/styles/components/Breadcrumbs.module.scss';
import Trail from './Trail';

// The cap keeps the box the width of the painted text, so the chevron sits
// against the label instead of drifting off the end of a full-width box.
// The CSS ellipsis stays as the backstop for wide glyphs and scaled-up text.
const MAX_CHARS = 22;
const KEPT_CHARS = 20;

function shorten(label) {
  const full = stegaClean(label);
  if (typeof full !== 'string' || full.length <= MAX_CHARS) return null;
  return { full, short: `${full.slice(0, KEPT_CHARS).trimEnd()}…` };
}

async function autoAncestors(path) {
  const paths = ancestorPaths(path);
  if (!paths.length) return [];

  const docs = await fetchSanity(breadcrumbAncestorsQuery, {
    params: { slugs: paths.map((href) => href.slice(1)) },
    tags: ['pages', 'portfolios']
  });

  // A layer with no page behind it has no name to show, so it is skipped rather than invented.
  return paths
    .map((href) => {
      const title = (docs ?? []).find(
        (doc) => `/${stegaClean(doc.slug)}` === href
      )?.title;
      return title ? { key: href, label: title, href } : null;
    })
    .filter(Boolean);
}

// Home and the current page are always added, so an editor crumb pointing at
// either would show the same page twice.
function isDuplicate(href, path) {
  if (!href) return false;
  const normalised = href.replace(/\/+$/, '') || '/';
  return normalised === '/' || normalised === path;
}

export default async function Breadcrumbs({ crumbs = [], mode, page }) {
  const path = pagePath(page);
  // the home page is the start of every trail, so it never shows one
  if (!path || path === '/') return null;

  const currentLabel = page?.title || page?.metadata?.seo?.metaTitle;
  const ancestors =
    stegaClean(mode) === 'auto'
      ? await autoAncestors(path)
      : (crumbs ?? [])
          .map((crumb) => ({
            key: crumb._key,
            // label fallbacks (internal title, external url) resolve in linkQuery
            label: crumb.label,
            href: resolveLink(crumb) ?? undefined
          }))
          .filter((item) => item.label && !isDuplicate(item.href, path));

  const items = [
    { key: 'home', label: 'Home', href: '/' },
    ...ancestors,
    ...(currentLabel ? [{ key: 'current', label: currentLabel }] : [])
  ];

  const site = await getSite();
  const logo = site?.logo ? sanitizeSvg(stegaClean(site.logo)) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: stegaClean(item.label),
      // href may be external and absolute; new URL() keeps it intact either way.
      ...(item.href && { item: new URL(item.href, baseUrl).href })
    }))
  };

  return (
    <nav aria-label='Breadcrumb' className={styles.nav}>
      <Trail>
        {items.map((item) => {
          const isCurrent = item.key === 'current';
          const isHome = item.key === 'home';
          // shortening drops the stega markers, so only shortened labels
          // lose visual editing; the full label stays the accessible name.
          const cut = isCurrent || isHome ? null : shorten(item.label);
          if (isHome) {
            return (
              <li key={item.key} className={styles.item}>
                <Link href='/' aria-label='Home' className={styles.home}>
                  {logo ? (
                    <span className={styles.mark} aria-hidden='true'>
                      <Logo svg={logo} />
                    </span>
                  ) : (
                    <span className={styles.label}>Home</span>
                  )}
                </Link>
              </li>
            );
          }
          return (
            <li key={item.key} className={styles.item}>
              {item.href && !isCurrent ? (
                <Link href={item.href} aria-label={cut?.full} title={cut?.full}>
                  <span className={styles.label}>
                    {cut ? cut.short : item.label}
                  </span>
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={isCurrent ? styles.current : undefined}>
                  <span className={styles.label}>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </Trail>
      <script
        type='application/ld+json'
        // Escape `<` so content containing `</script>` can't break out of the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      />
    </nav>
  );
}

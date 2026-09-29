import { orderCategories } from '@/lib/posts';

// "ruben-p.com/portfolio/": the host and the page's parent path.
export function pathLine(host, path) {
  return host.replace(/^www\./, '') + path.replace(/[^/]+$/, '');
}

const longDate = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00Z`).toLocaleDateString(
    'en-AU',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
  );

// The first candidate with any words; a whitespace-only field counts as unset.
const firstSet = (...candidates) =>
  candidates
    .map((c) => (typeof c === 'string' ? c.trim() : ''))
    .find(Boolean) ?? '';

// The card's words. A page's own title comes before the site's, unlike the meta tags, and nothing
// in the facts row is said twice in the description.
export function cardText({ page, social, site, path }) {
  if (social)
    return {
      title: firstSet(social.title),
      description: '',
      facts: { handle: firstSet(social.username) }
    };
  const seo = page.seo ?? {};
  const facts =
    page._type === 'page.post'
      ? {
          date: page.publishDate ? longDate(page.publishDate) : null,
          categories: orderCategories(
            page.categories ?? [],
            site.postCategories ?? []
          )
        }
      : {};
  const description = firstSet(
    seo.openGraph?.description,
    seo.metaDescription,
    page.summary,
    site.metaDescription
  );
  const factTexts = [
    facts.date,
    ...(facts.categories ?? []).map((c) => c.title)
  ];
  return {
    title: firstSet(
      path === '/' && site.title,
      seo.openGraph?.title,
      seo.metaTitle,
      page.title
    ),
    description: factTexts.includes(description) ? '' : description,
    facts
  };
}

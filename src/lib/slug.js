// Pages that only lend their content to the not-found and redirect screens,
// never served at their own path.
export const templateSlugs = ['404', 'redirect'];

// A slug that is a real URL path; templates have no slash.
export const isPagePath = (slug) =>
  typeof slug === 'string' &&
  /^\/([\p{L}\p{N}_-]+(\/[\p{L}\p{N}_-]+)*)?$/u.test(slug);

// A page the sitemap and feed may list; one that sets no noindex follows the site's.
export const isIndexable = ({ slug, noindex }, site) =>
  isPagePath(slug) && (noindex ?? site?.noindex) !== true;

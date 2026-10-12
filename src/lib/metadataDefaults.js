// Merges a page SEO object over the site one, field by field.
export const withDefaults = (page, site) => {
  if (!page && !site) return undefined;
  return Object.fromEntries(
    Object.keys({ ...site, ...page }).map((key) => [
      key,
      page?.[key] ?? site?.[key]
    ])
  );
};

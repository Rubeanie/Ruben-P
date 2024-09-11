export const slug = (prefix = '') => {
  return {
    name: 'slug',
    type: 'slug',
    description: 'URL path / permalink. Use "index" for the home page.',
    options: {
      source: (doc) =>
        prefix +
        (doc.name ||
          doc.title ||
          (doc.metadata.seo !== undefined
            ? doc.metadata.seo.metaTitle
            : null)),
      slugify: (input) =>
        input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .slice(0, 200)
          .replace(/[&\\#,+()$~%.'"!:*?<>{}]/g, '')
    },
    validation: (Rule) => Rule.required()
  }
};

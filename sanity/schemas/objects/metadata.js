export const metadata = {
  name: 'metadata',
  description: 'For search engines',
  type: 'object',
  fields: [
    {
      name: 'slug',
      type: 'slug',
      description: 'URL path / permalink. Use "index" for the home page.',
      options: {
        source: (doc) =>  doc.name || doc.title || (doc.metadata.seo !== undefined ? doc.metadata.seo.metaTitle : null)
      },
      validation: (Rule) => Rule.required()
    },
    {
      name: 'seo',
      type: 'seoMetaFields'
    }
  ]
};

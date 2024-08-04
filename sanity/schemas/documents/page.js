import {
  VscBrowser,
  VscHome,
  VscEyeClosed,
  VscQuestion
} from 'react-icons/vsc';

export const page = {
  name: 'page',
  type: 'document',
  icon: VscBrowser,
  groups: [
    { name: 'content', default: true },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    {
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'modules',
      description: 'Page content',
      type: 'array',
      group: 'content',
      of: [
        { type: 'theme' }
        /*  { type: 'theme' } */ /* TODO:add more types */
      ],
      options: {
        insertMenu: {
          views: [{ name: 'list' }, { name: 'grid' }]
        }
      }
    } /* TODO: create metadata object */,
    {
      name: 'slug',
      type: 'slug',
      description: 'URL path / permalink. Use "index" for the homepage.',
      group: 'seo',
      options: {
        source: (doc) => doc.metadata.title || doc.name || doc.title
      },
      validation: (Rule) => Rule.required()
    },
    {
      name: 'metadata',
      type: 'seoMetaFields',
      group: 'seo'
    }
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      media: 'metadata.seo.openGraph.image',
      index: 'metadata'
    },
    prepare: () => ({
      title,
      subtitle: slug && (slug === 'index' ? '/' : `/${slug}`),
      media:
        media ||
        (slug === 'index' && VscHome) ||
        (slug === '404' && VscQuestion) /* TODO: noindex check */
    })
  }
};

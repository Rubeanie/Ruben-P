import { MdWeb } from 'react-icons/md';

export const site = {
  name: 'site',
  type: 'document',
  icon: MdWeb,
  groups: [
    { name: 'general', default: true },
    { name: 'navigation' },
    { name: 'seo' }
  ],
  fields: [
    {
      name: 'title',
      type: 'string',
      group: 'general',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'logo',
      type: 'inlineSvg',
      group: 'general',
      description: 'Site mark for the navbar and footer.',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'themes',
      type: 'array',
      group: 'general',
      of: [{ name: 'theme', type: 'reference', to: [{ type: 'theme' }] }]
    },
    {
      name: 'postCategories',
      title: 'Post categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'post.category' }] }],
      validation: (Rule) => Rule.unique(),
      group: 'general',
      description:
        'The order of the filter chips and the dots on every post tile. A category left out is never a chip.'
    },
    {
      name: 'announcements',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'announcement' }] }],
      group: 'general',
      description:
        'One announcement shown at a time. Top items have higher precedence.'
    },
    {
      name: 'headerMenu',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation'
    },
    {
      name: 'footerMenu',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation'
    },
    {
      name: 'seo',
      title: 'Default SEO',
      type: 'seoMetaFields',
      group: 'seo'
    }
  ],
  preview: {
    prepare: () => ({
      title: 'Site'
    })
  }
};

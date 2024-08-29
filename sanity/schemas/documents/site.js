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
      name: 'themes',
      type: 'array',
      group: 'general',
      of: [{ name: 'theme', type: 'reference', to: [{ type: 'theme' }] }]
    },
    {
      name: 'announcements',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'announcement' }] }],
      group: 'general',
      description: 'One announcement shown at a time. Top items have higher precedence.'
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

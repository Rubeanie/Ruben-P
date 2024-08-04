import { VscSymbolClass } from 'react-icons/vsc';

export const navigation = {
  name: 'navigation',
  type: 'document',
  icon: VscSymbolClass,
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'themes',
      type: 'array',
      group: 'general',
      of: [{ name: 'theme', type: 'reference', to: [{ type: 'theme' }] }]
    },
    {
      name: 'headerMenu',
      type: 'reference',
      to: [{ type: 'navigation' }], //TODO: create navigation
      group: 'navigation'
    },
    {
      name: 'footerMenu',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation'
    },
    /* {
      name: 'social',
      type: 'reference',
      to: [{ type: 'social' }], //TODO: create social
      group: 'navigation'
    }, */
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

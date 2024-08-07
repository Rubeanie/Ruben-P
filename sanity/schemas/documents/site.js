import { CgWebsite } from 'react-icons/cg';

export const site = {
  name: 'site',
  type: 'document',
  icon: CgWebsite,
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
      group: 'general'
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
      to: [{ type: 'navigation' }],
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
    } */
    {
      name: 'metadata',
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

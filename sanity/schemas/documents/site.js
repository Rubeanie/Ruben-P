import { MdWeb } from 'react-icons/md';
import { SharePreviewInput } from '../../src/components/SharePreview/SharePreviewInput';

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
      description: 'Site mark for the navbar, footer and loader.',
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
      name: 'author',
      title: 'Default author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'general',
      description: 'Credited on every post that names no authors of its own'
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
      group: 'seo',
      components: { input: SharePreviewInput }
    },
    {
      name: 'robotsDisallow',
      title: 'Blocked paths',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'seo',
      initialValue: ['/admin', '/api'],
      validation: (Rule) =>
        Rule.custom((paths) =>
          (paths ?? []).every((path) => path?.startsWith('/'))
            ? true
            : 'Every path must start with /'
        ),
      description:
        "Paths crawlers are asked to skip. Pages with Prevent indexing must stay crawlable so search engines can read their noindex; don't list them here."
    }
  ],
  preview: {
    prepare: () => ({
      title: 'Site'
    })
  }
};

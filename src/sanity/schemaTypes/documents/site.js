import { MdWeb } from 'react-icons/md';
import { SharePreviewInput } from '../../components/SharePreview/SharePreviewInput';

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
      description: 'Credited on every post that names no authors of its own',
      validation: (Rule) => Rule.required()
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
      name: 'alternateName',
      type: 'string',
      group: 'seo',
      description: 'A short name search engines can use for the site'
    },
    {
      name: 'copyrightNotice',
      type: 'string',
      group: 'seo',
      description:
        "Shown with the site's images in search results. Images are credited to the Default author, and this defaults to their name. For someone else's photo, set its Credit line in Media to just their name: it replaces the author and these rights."
    },
    {
      name: 'license',
      title: 'License URL',
      type: 'url',
      group: 'seo',
      description: 'Where the terms for reusing the images are published'
    },
    {
      name: 'acquireLicensePage',
      title: 'Get license page',
      type: 'url',
      group: 'seo',
      description: 'Where someone can ask to use the images'
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

import { IoMdLink } from 'react-icons/io';

export const link = {
  name: 'link',
  type: 'object',
  icon: IoMdLink,
  options: {
    columns: 2
  },
  fields: [
    {
      name: 'label',
      type: 'string'
    },
    {
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal', value: 'internal' },
          { title: 'External', value: 'external' }
        ]
      }
    },
    {
      name: 'internal',
      type: 'reference',
      to: [
        {
          type: 'page'
        },
        {
          type: 'page.post'
        }
      ],
      // Template pages (404, redirect) have no path to link to.
      options: { filter: 'string::startsWith(metadata.slug.current, "/")' },
      hidden: ({ parent }) => parent?.type !== 'internal'
    },
    {
      name: 'external',
      type: 'url',
      placeholder: 'https://example.com',
      validation: (Rule) =>
        Rule.uri({
          // any scheme except the executable ones; mirrors isSafeHref in
          // src/lib/processUrl.js
          scheme: /^(?!(?:javascript|data|vbscript|blob|file)$)/i,
          allowRelative: true
        }),
      hidden: ({ parent }) => parent?.type !== 'external'
    },
    {
      name: 'params',
      title: 'URL parameters',
      placeholder: 'e.g. #jump-link or ?foo=bar',
      type: 'string',
      hidden: ({ parent }) => !parent?.type
    }
  ],
  preview: {
    select: {
      label: 'label',
      title: 'internal.title',
      slug: 'internal.metadata.slug.current',
      external: 'external',
      params: 'params'
    },
    prepare({ label, title, slug, external, params }) {
      return {
        title: label || title,
        subtitle: [external || slug, params].filter(Boolean).join('')
      };
    }
  }
};

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
          /* type: 'portfolio.post' TODO: */
          /* type: 'social' */
        }
      ],
      hidden: ({ parent }) => parent?.type !== 'internal'
    },
    {
      name: 'external',
      type: 'url',
      placeholder: 'https://example.com',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
          allowRelative: true
        }),
      hidden: ({ parent }) => parent?.type !== 'external'
    },
    {
      name: 'params',
      title: 'URL parameters',
      placeholder: 'e.g. #jump-link or ?foo=bar',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'internal'
    }
  ],
  preview: {
    select: {
      label: 'label',
      _type: 'internal._type',
      title: 'internal.title',
      slug: 'internal.metadata.slug.current',
      external: 'external',
      params: 'params'
    },
    prepare({ label, _type, title, slug, external, params }) {
      return {
        title: label || title,
        subtitle: [
          /* _type === 'portfolio.post' ? '/portfolio' : null, */
          external || (slug && (slug === 'index' ? '/' : `/${slug}`)),
          params
        ]
          .filter(Boolean)
          .join('')
      };
    }
  }
};

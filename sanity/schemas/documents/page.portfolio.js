import { MdEdit } from 'react-icons/md';
import { pageBlock } from '../fragments/page-block';

export const pagePortfolio = {
  name: 'page.portfolio',
  title: 'Portfolio Post',
  icon: MdEdit,
  type: 'document',
  groups: [
    { name: 'content', default: true },
    { name: 'options' },
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
      ...pageBlock,
      group: 'content'
    },
    {
      name: 'categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'portfolio.category' }]
        }
      ],
      group: 'options'
    },
    {
      name: 'publishDate',
      type: 'date',
      validation: (Rule) => Rule.required(),
      group: 'content'
    },
    {
      name: 'featured',
      type: 'boolean',
      group: 'options',
      initialValue: false
    },
    {
      name: 'metadata',
      type: 'metadata',
      group: 'seo'
    }
  ],
  preview: {
    select: {
      featured: 'featured',
      title: 'metadata.seo.metaTitle',
      subtitle: 'publishDate',
      media: 'metadata.seo.openGraph.image'
    },
    prepare({ featured, title, subtitle, media }) {
      return {
        title: [featured && '⭐', title].filter(Boolean).join(' '),
        subtitle,
        media
      };
    }
  },
  orderings: [
    {
      title: 'Date',
      name: 'date',
      by: [{ field: 'publishDate', direction: 'desc' }]
    },
    {
      title: 'Title',
      name: 'metadata.seo.metaTitle',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
};

import { MdEdit } from 'react-icons/md';
import { pageBlock } from '../fragments/page-block';
import { metadata } from '../fragments/metadata';

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
      options: {
        dateFormat: 'DD-MM-YYYY'
      },
      group: 'content'
    },
    {
      name: 'featured',
      type: 'boolean',
      group: 'options',
      initialValue: false
    },
    {
      name: 'tableOfContents',
      type: 'boolean',
      initialValue: false,
      group: 'options'
    },
    {
      name: 'tocPosition',
      type: 'string',
      options: {
        list: ['left', 'right'],
        layout: 'radio'
      },
      hidden: ({ parent }) => !parent?.tableOfContents,
      initialValue: 'right',
      group: 'options'
    },
    {
      ...metadata('portfolio/'),
      group: 'seo'
    }
  ],
  preview: {
    select: {
      featured: 'featured',
      title: 'title',
      date: 'publishDate',
      media: 'metadata.seo.openGraph.image'
    },
    prepare({ featured, title, date, media }) {
      return {
        title: [featured && '⭐', title].filter(Boolean).join(' '),
        subtitle: date,
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
      name: 'title',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
};

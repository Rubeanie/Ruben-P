import { MdEdit } from 'react-icons/md';
import { textBlock } from '../fragments/text-block';
import { getBlockText } from '@sanity/src/utils';

export const portfolioList = {
  name: 'portfolio-list',
  title: 'Portfolio list',
  icon: MdEdit,
  type: 'object',
  groups: [
    { name: 'content', default: true },
    { name: 'filtering' },
    { name: 'options' }
  ],
  fields: [
    {
      name: 'intro',
      ...textBlock,
      group: 'content'
    },
    {
      name: 'layout',
      type: 'string',
      options: {
        list: ['grid', 'carousel'],
        layout: 'radio'
      },
      initialValue: 'carousel',
      group: 'options'
    },
    {
      name: 'limit',
      type: 'number',
      description: 'Number of posts to show. Leave empty to show all posts.',
      validation: (Rule) => Rule.min(1).integer(),
      group: 'filtering'
    },
    {
      name: 'displayFilters',
      title: 'Display category filter buttons',
      type: 'boolean',
      initialValue: true,
      group: 'filtering'
    },
    {
      name: 'predefinedFilters',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'portfolio.category' }]
        }
      ],
      description: 'Filter posts by category',
      group: 'filtering'
    }
  ],
  preview: {
    select: {
      intro: 'intro'
    },
    prepare({ intro }) {
      return {
        title: getBlockText(intro),
        subtitle: 'Blog list'
      }
    }
  }
};
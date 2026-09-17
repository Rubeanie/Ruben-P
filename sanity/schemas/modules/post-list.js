import { MdEdit } from 'react-icons/md';
import { count } from '@sanity/src/utils';

export const postList = {
  name: 'post-list',
  title: 'Post list',
  icon: MdEdit,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'filtering' }],
  fields: [
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
          to: [{ type: 'post.category' }]
        }
      ],
      description:
        'Chips to show, in this order. Empty shows every category that has posts.',
      group: 'filtering'
    }
  ],
  preview: {
    select: {
      predefinedFilters: 'predefinedFilters'
    },
    prepare({ predefinedFilters }) {
      return {
        title: 'Post list',
        subtitle: count(predefinedFilters, 'category')
      };
    }
  }
};

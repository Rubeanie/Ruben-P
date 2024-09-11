import { MdAccountTree } from 'react-icons/md';
import { count } from '@sanity/src/utils';

export const navigation = {
  name: 'navigation',
  type: 'document',
  icon: MdAccountTree,
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'items',
      type: 'array',
      of: [{ type: 'link' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items'
    },
    prepare: ({ title, items }) => ({
      title,
      subtitle: count(items, "link")
    })
  }
};

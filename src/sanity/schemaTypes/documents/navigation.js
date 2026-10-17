import { MdAccountTree } from 'react-icons/md';
import { count } from '@/sanity/utils';

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
      name: 'leadLink',
      title: 'Lead link',
      description:
        "Where the navbar logo goes. Its label names the logo link and lists it in the dropdown; blank uses the page's title.",
      type: 'link'
    },
    {
      name: 'items',
      type: 'array',
      of: [{ type: 'link' }]
    },
    {
      name: 'cta',
      title: 'Call to action',
      description: 'Navbar only: an optional button at the end of the bar.',
      type: 'link'
    }
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items'
    },
    prepare: ({ title, items }) => ({
      title,
      subtitle: count(items, 'link')
    })
  }
};

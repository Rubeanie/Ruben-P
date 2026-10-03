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
      name: 'leadLink',
      title: 'Lead link',
      description:
        "Where this menu's lead element goes: the logo in the navbar. Its label only shows in the navbar's dropdown.",
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
      description: 'Optional link shown as a button at the end of the bar.',
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

import { MdBrush } from 'react-icons/md';

export const artist = {
  name: 'artist',
  title: 'Artist',
  type: 'document',
  icon: MdBrush,
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'link',
      type: 'link',
      description: 'Where the credit leads'
    }
  ],
  preview: {
    select: { title: 'name' }
  }
};

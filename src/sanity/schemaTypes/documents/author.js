import { MdPerson } from 'react-icons/md';

export const author = {
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: MdPerson,
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Square crop works best'
    },
    {
      name: 'link',
      type: 'link',
      description: 'Where the name and photo lead'
    },
    {
      name: 'jobTitle',
      type: 'string',
      description: 'Shown to search engines, e.g. Web developer'
    }
  ],
  preview: {
    select: { title: 'name', media: 'photo' }
  }
};

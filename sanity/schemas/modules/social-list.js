import { MdAccountCircle } from 'react-icons/md';

export const socialList = {
  name: 'social-list',
  title: 'Social list',
  icon: MdAccountCircle,
  type: 'object',
  fields: [
    {
      name: 'socials',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'social' }] }]
    },
    {
      name: 'maxColumns',
      title: 'Max columns',
      type: 'number',
      description:
        'Upper limit — narrow screens show fewer columns as space runs out',
      initialValue: 2,
      validation: (Rule) => Rule.required().integer().min(1).max(4)
    }
  ],
  preview: {
    select: {
      socials: 'socials'
    },
    prepare({ socials }) {
      return {
        title: 'Social list',
        subtitle: `${socials?.length ?? 0} socials`
      };
    }
  }
};

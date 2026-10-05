import { MdHeight } from 'react-icons/md';

const sizes = [
  { title: 'Small', value: 'small' },
  { title: 'Medium', value: 'medium' },
  { title: 'Large', value: 'large' },
  { title: 'Extra large', value: 'xl' }
];

export const spacer = {
  name: 'spacer',
  title: 'Spacer',
  icon: MdHeight,
  type: 'object',
  description: 'Adds space between the blocks around it.',
  fields: [
    {
      name: 'size',
      type: 'string',
      options: { list: sizes, layout: 'radio' },
      initialValue: 'medium'
    }
  ],
  preview: {
    select: { size: 'size' },
    prepare: ({ size }) => ({
      title: 'Spacer',
      subtitle: sizes.find((s) => s.value === (size ?? 'medium')).title
    })
  }
};

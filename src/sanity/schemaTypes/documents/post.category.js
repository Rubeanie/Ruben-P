import { IoMdPricetag } from 'react-icons/io';

export const postCategory = {
  name: 'post.category',
  title: 'Post category',
  type: 'document',
  icon: IoMdPricetag,
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'color',
      type: 'color',
      options: { disableAlpha: true },
      description: 'Tints the active filter chip and the dot before the name'
    }
  ],
  preview: {
    select: { title: 'title', color: 'color.hex' },
    prepare: ({ title, color }) => ({
      title,
      media: (
        <span
          className='category-swatch'
          style={{ background: color || 'transparent' }}
        />
      )
    })
  }
};

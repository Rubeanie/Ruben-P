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
      description:
        'Tints the category’s filter chip, its dot on post tiles and its capsule on the post page'
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

import { IoMdColorFill } from 'react-icons/io';

/* eslint-disable @next/next/no-img-element */
export const style = {
  name: 'style',
  type: 'object',
  icon: IoMdColorFill,
  fields: [
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'image',
      type: 'cloudinary.asset',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'message',
      type: 'string'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'message',
      url: 'image.secure_url'
    },
    prepare({ title, subtitle, url }) {
      return {
        title: title || 'Untitled Style',
        subtitle,

        media:
          url !== undefined ? (
            <img
              src={url}
              alt='Style Preview Image'
              style={{
                height: '100%',
                width: 'auto',
                display: 'block',
                left: 'unset'
              }}
            />
          ) : null
      };
    }
  }
};

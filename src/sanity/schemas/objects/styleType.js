/* eslint-disable @next/next/no-img-element */
export const style = {
  name: 'styleType',
  type: 'object',
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
        title,
        subtitle,

        // `media` takes a function, string or React element
        // Remember to import React from 'react' if you are rendering React components like below
        media: (
          <img
            src={url}
            alt='Style Preview Image'
            style={{ height: '100%', width: 'auto', display: 'block' }}
          />
        )
      };
    }
  }
};

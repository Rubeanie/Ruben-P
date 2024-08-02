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
      message: 'message',
      url: 'image.secure_url'
    },
    prepare(selection) {
      const { title, message, url } = selection;
      return {
        title: title,
        subtitle: message,

        // `media` takes a function, string or React element
        // Remember to import React from 'react' if you are rendering React components like below
        media: <img src={url} />
      };
    }
  }
};

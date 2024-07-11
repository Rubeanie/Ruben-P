import React from "react";

export default {
  name: "theme",
  title: "Themes",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "assets",
      type: "array",
      title: "Assets",
      of: [
        {
          name: "asset",
          type: "object",
          fields: [
            {
              title: "Image",
              name: "image",
              type: "cloudinary.asset",
            },
            {
              title: "Message",
              name: "message",
              type: "string",
            }
          ],
          preview: {
            select: {
              title: "image.public_id",
              message: "message",
              url: "image.url",
            },
            prepare(selection) {
              const { title, message, url } = selection;
              return {
                title: title,
                subtitle: message,
              
                // `media` takes a function, string or React element
                // Remember to import React from 'react' if you are rendering React components like below
                media: <img src={url} />,
              };
            },
          },
        },
      ],
    },
    {
      title: "Should this theme be prioritized?",
      name: "prioritize",
      type: "boolean",
      initialValue: false,
    },
  ],
};

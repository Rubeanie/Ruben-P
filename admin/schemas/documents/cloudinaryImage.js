import React from "react";

export default {
  name: "cloudinaryImage",
  title: "Cloudinary Images",
  type: "document",
  fields: [
    {
      title: "URL",
      name: "url",
      type: "string",
    },
    {
      title: "Message",
      name: "message",
      type: "string",
    },
  ],
  preview: {
    select: {
      title: "url",
      message: "message",
      url: "url",
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
};

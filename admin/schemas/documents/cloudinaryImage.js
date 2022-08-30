import React from "react";

export default {
  name: "cloudinaryImage",
  title: "Cloudinary Images",
  type: "document",
  fields: [
    {
      title: "Image",
      name: "image",
      type: "string",
      type: "cloudinary.asset",
      options: {
        hotspot: true,
      },
    },
    {
      title: "Message",
      name: "message",
      type: "string",
    },
  ],
  preview: {
    select: {
      title: "image.url",
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
};

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
        { name: "asset", type: "reference", to: { type: "cloudinaryImage" } },
      ],
    },
  ],
};

import React from "react";

export default {
  name: "skill",
  title: "Skills",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Skill Name",
      type: "string",
    },
    {
      name: 'image',
      title: 'Logo',
      type: 'image',
    },
    {
      title: "Text Color",
      name: "textColor",
      type: "color",
    },
    {
      title: "Base Color",
      name: "baseColor",
      type: "color",
    },
    {
      title: "External URL",
      name: "url",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ["https", "http", "mailto", "tel"],
        }),
    },
  ],
};

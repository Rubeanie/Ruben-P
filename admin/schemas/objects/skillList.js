import React from "react";

export default {
  name: "skillList",
  title: "Skill List",
  type: "object",
  fields: [
    {
      name: "skills",
      type: "array",
      title: "My Skills",
      of: [
        { type: "reference", to: { type: "skill" } },
      ],
    },
  ],
};

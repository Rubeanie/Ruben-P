export default {
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
/*     {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    }, */
    {
      name: "modules",
      type: "array",
      title: "Page Content",
      of: [
        { name: "skills", type: "skillList" },
        { name: "html", type: "blockContent",}
      ],
    },
/*     {
      title: "Priority",
      name: "priority",
      type: "number",
    },
    {
      name: "content",
      type: "blockContent",
      title: "Content",
    }, */
  ],
/*   orderings: [
    {
      title: "Priority",
      name: "priorityAsc",
      by: [{ field: "priority", direction: "asc" }],
    },
  ], */

  preview: {
    select: {
      title: "title",
    },
  },
};

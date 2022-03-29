export default {
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    },
    {
      title: "Priority",
      name: "priority",
      type: "number",
    },
    {
      name: "content",
      type: "blockContent",
      title: "Content",
    },
  ],
  orderings: [
    {
      title: "Priority",
      name: "priorityAsc",
      by: [{ field: "priority", direction: "asc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
    },
  },
};

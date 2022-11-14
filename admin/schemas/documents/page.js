import React from 'react'
import { Browser } from 'phosphor-react'

export default {
  name: "page",
  title: "Page",
  type: "document",
  icon: () => <Browser />,
  groups: [
    { title: 'Content', name: 'content', default: true },
    { title: 'Settings', name: 'settings' }
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'settings'
    },
    {
      title: 'URL Slug',
      name: 'slug',
      type: 'slug',
      description: '(required)',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required(),
      group: 'settings'
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
      group: 'content'
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo',
      group: 'settings'
    }
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
      title: 'title',
      slug: 'slug'
    },
    prepare({ title = 'Untitled', slug = {} }) {
      const path = `/${slug.current}`
      return {
        title,
        subtitle: slug.current ? path : '(missing slug)'
      }
    }
  }
};

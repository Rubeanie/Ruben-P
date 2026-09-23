import { MdEdit } from 'react-icons/md';
import { pageBlock } from '../fragments/page-block';
import { metadata } from '../fragments/metadata';

// Module types that carry a heading of their own.
const HEADED = new Set(['hero', 'hero.saas', 'hero.split', 'richtext-module']);

export const pagePost = {
  name: 'page.post',
  title: 'Post',
  icon: MdEdit,
  type: 'document',
  groups: [
    { name: 'content', default: true },
    { name: 'options' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    {
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'cover',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown on tiles and at the top of the post',
      validation: (Rule) => Rule.required(),
      group: 'content'
    },
    {
      name: 'summary',
      type: 'string',
      description: 'One sentence, shown on tiles and under the title',
      validation: (Rule) => Rule.required().max(160),
      group: 'content'
    },
    {
      name: 'modules',
      ...pageBlock,
      // Post details read post fields, so plain pages never offer the module.
      of: [...pageBlock.of, { type: 'post-details' }],
      validation: (Rule) =>
        Rule.custom((modules) =>
          (modules ?? []).some((module) => HEADED.has(module._type))
            ? true
            : 'A post needs one heading: add a hero or a rich text block with a heading'
        ).warning(),
      group: 'content'
    },
    {
      name: 'authors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'author' }] }],
      validation: (Rule) => Rule.unique(),
      group: 'options',
      description: "Leave empty to credit the site's default author"
    },
    {
      name: 'categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'post.category' }]
        }
      ],
      group: 'options'
    },
    {
      name: 'publishDate',
      type: 'date',
      validation: (Rule) => Rule.required(),
      options: {
        dateFormat: 'DD-MM-YYYY'
      },
      group: 'content'
    },
    {
      name: 'featured',
      type: 'boolean',
      group: 'options',
      initialValue: false
    },
    {
      name: 'tableOfContents',
      type: 'boolean',
      initialValue: false,
      group: 'options'
    },
    {
      name: 'tocPosition',
      type: 'string',
      options: {
        list: ['left', 'right'],
        layout: 'radio'
      },
      hidden: ({ parent }) => !parent?.tableOfContents,
      initialValue: 'right',
      group: 'options'
    },
    {
      ...metadata('portfolio/'),
      group: 'seo'
    }
  ],
  preview: {
    select: {
      featured: 'featured',
      title: 'title',
      date: 'publishDate',
      media: 'cover'
    },
    prepare({ featured, title, date, media }) {
      return {
        title: [featured && '⭐', title].filter(Boolean).join(' '),
        subtitle: date,
        media
      };
    }
  },
  orderings: [
    {
      title: 'Date',
      name: 'date',
      by: [{ field: 'publishDate', direction: 'desc' }]
    },
    {
      title: 'Title',
      name: 'title',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
};

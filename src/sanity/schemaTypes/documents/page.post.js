import { MdEdit } from 'react-icons/md';
import { assetPreview } from '../../components/CloudinaryPreview';
import { imageRequired } from '../objects/cloudinary-image';
import { pageBlock } from '../fragments/page-block';
import { metadata } from '../fragments/metadata';
import { headingLinksField } from '../fragments/fields/heading-links';
import { animateModulesField } from '../fragments/fields/animate-modules';
import { headingsOf } from '../../seo/checks';

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
      type: 'cloudinaryImage',
      description: 'Shown on tiles and share cards',
      validation: imageRequired,
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
      validation: (Rule) => [
        ...pageBlock.validation(Rule),
        Rule.custom((modules) =>
          headingsOf(modules).some((heading) => heading.level === 1)
            ? true
            : 'No Heading 1. Give the hero or the first rich text block one.'
        ).warning()
      ],
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
      // Order comes from Site settings.
      options: { sortable: false },
      validation: (Rule) => Rule.unique(),
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
    // Written by the publish action: the zone the editor was in, for the day of the edit.
    { name: 'editedZone', type: 'string', hidden: true, readOnly: true },
    headingLinksField({ group: 'options' }),
    animateModulesField,
    {
      ...metadata('/portfolio/'),
      group: 'seo'
    }
  ],
  preview: {
    select: {
      featured: 'featured',
      title: 'title',
      date: 'publishDate',
      cover: 'cover.asset'
    },
    prepare({ featured, title, date, cover }) {
      return {
        title: [featured && '⭐', title].filter(Boolean).join(' '),
        subtitle: date,
        // Sanity Studio preview thumbnail, next/image doesn't run in Studio.
        media: assetPreview(cover)
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

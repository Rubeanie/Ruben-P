import { robots } from "../../components/seo"

export default {
  title: 'SEO / Share Settings',
  name: 'seo',
  type: 'object',
  options: {
    collapsible: true,
  },
  fields: [
    {
      title: 'Meta Title',
      name: 'metaTitle',
      type: 'string',
      description: 'Title used for search engines and browsers',
      validation: (Rule) =>
        Rule.max(50).warning(
          'Longer titles may be truncated by search engines',
        ),
    },
    {
      title: 'Meta Description',
      name: 'metaDesc',
      type: 'text',
      rows: 3,
      description: 'Description for search engines',
      validation: (Rule) =>
        Rule.max(150).warning(
          'Longer descriptions may be truncated by search engines',
        ),
    },
    {
      title: 'Search Keywords',
      name: 'keywords',
      type: 'string',
      description: 'Keywords for search engines',
    },
    {
      title: 'Search Indexing',
      name: 'robots',
      type: 'object',
      description: 'How search engine indexing should be handled',
      inputComponent: robots,
      fields: [
        {
          name: 'index',
          type: 'string',
          group: 'index',
          options: {
            list: [
              { title: 'Allow', value: 'index' },
              { title: 'Deny', value: 'noindex' },
            ],
            layout: 'dropdown',
          },
          initialValue: null,
        },
        {
          name: 'follow',
          type: 'string',
          group: 'follow',
          options: {
            list: [
              { title: 'Allow', value: 'follow' },
              { title: 'Deny', value: 'nofollow' },
            ],
            layout: 'dropdown',
          },
          initialValue: null,
        },
      ],
    },
    {
      title: 'Share Title',
      name: 'shareTitle',
      type: 'string',
      description: 'Title used for social sharing cards',
      validation: (Rule) =>
        Rule.max(50).warning('Longer titles may be truncated by social sites'),
    },
    {
      title: 'Share Description',
      name: 'shareDesc',
      type: 'text',
      rows: 3,
      description: 'Description used for social sharing cards',
      validation: (Rule) =>
        Rule.max(150).warning(
          'Longer descriptions may be truncated by social sites',
        ),
    },
    {
      title: 'Share Graphic',
      name: 'shareGraphic',
      type: 'image',
      description: 'Recommended size: 1200x630 (PNG or JPG)',
    },
  ],
}

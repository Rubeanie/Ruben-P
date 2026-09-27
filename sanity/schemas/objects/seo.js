import { MdLabel, MdCode } from 'react-icons/md';

export const seoMetaFields = {
  name: 'seoMetaFields',
  title: 'SEO',
  type: 'object',
  fields: [
    {
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description:
        'The title used in search results and browser tabs. Recommended length: 50-60 characters.'
    },
    {
      name: 'metaDescription',
      title: 'Meta description',
      type: 'string',
      description:
        'The summary shown under the title in search results. Recommended length: 100-160 characters.'
    },
    {
      name: 'seoKeywords',
      title: 'Additional keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      description: 'Extra keywords for this page, added to the site defaults.'
    },
    {
      name: 'nofollowAttributes',
      title: 'Prevent indexing',
      type: 'boolean',
      description:
        'Asks search engines not to index or follow links (adds noindex, nofollow).',
      initialValue: false
    },
    {
      name: 'openGraph',
      type: 'openGraph',
      description:
        'Controls how this page looks when shared on Facebook, LinkedIn, Slack, and similar platforms.'
    },
    {
      name: 'twitter',
      title: 'Twitter / X',
      type: 'twitter'
    },
    {
      name: 'additionalMetaTags',
      title: 'Additional meta tags',
      type: 'array',
      of: [{ type: 'metaTag' }],
      description: 'Extra meta tags to add to the page head.'
    },
    // Left over from the old SEO plugin on a few pages; kept hidden so the Studio doesn't flag it.
    { name: 'seoStatus', type: 'string', hidden: true }
  ]
};

export const openGraph = {
  name: 'openGraph',
  title: 'Open Graph',
  type: 'object',
  fields: [
    {
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Overrides the canonical URL used for this share.'
    },
    {
      name: 'image',
      type: 'image',
      description: 'Recommended size: 1200x630 pixels.'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Overrides the meta title when this page is shared.'
    },
    {
      name: 'description',
      type: 'string',
      description: 'Overrides the meta description when this page is shared.'
    },
    {
      name: 'siteName',
      title: 'Site name',
      type: 'string'
    }
  ]
};

export const twitter = {
  name: 'twitter',
  title: 'Twitter / X',
  type: 'object',
  fields: [
    {
      name: 'handle',
      type: 'string',
      description: 'The @handle of the content author.'
    },
    {
      name: 'site',
      type: 'string',
      description: 'The @handle of the website or publisher.'
    },
    {
      name: 'cardType',
      title: 'Card type',
      type: 'string',
      description: 'Twitter card layout, e.g. summary or summary_large_image.'
    },
    {
      name: 'creator',
      type: 'string',
      description:
        'The @handle of the content creator, if different from the author.'
    }
  ]
};

export const metaTag = {
  name: 'metaTag',
  title: 'Meta tag',
  icon: MdLabel,
  type: 'object',
  fields: [
    {
      name: 'metaAttributes',
      title: 'Attributes',
      type: 'array',
      of: [{ type: 'metaAttribute' }]
    }
  ],
  preview: {
    select: {
      metaTags: 'metaAttributes'
    },
    prepare({ metaTags }) {
      return {
        title:
          metaTags?.[0]?.attributeKey ||
          metaTags?.[0]?.attributeValueString ||
          'Meta tag'
      };
    }
  }
};

export const metaAttribute = {
  name: 'metaAttribute',
  title: 'Meta attribute',
  icon: MdCode,
  type: 'object',
  fields: [
    {
      name: 'attributeKey',
      title: 'Key',
      type: 'string',
      description: 'The meta attribute name, e.g. og:image or twitter:label1.'
    },
    {
      name: 'attributeType',
      title: 'Type',
      type: 'string',
      options: {
        list: ['string', 'image'],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 'image'
    },
    {
      name: 'attributeValueImage',
      title: 'Image value',
      type: 'image',
      hidden: ({ parent }) => parent?.attributeType !== 'image'
    },
    {
      name: 'attributeValueString',
      title: 'Text value',
      type: 'string',
      hidden: ({ parent }) => parent?.attributeType !== 'string'
    }
  ],
  preview: {
    select: {
      title: 'attributeKey'
    }
  }
};

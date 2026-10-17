import { SeoFeedbackInput } from '../../components/SeoFeedback/SeoFeedbackInput';
import { NoIndexInput } from '../../components/NoIndexInput';
import { DESCRIPTION_LENGTH, TITLE_LENGTH } from '@/lib/studioReviewLimits';

// Titles and the share image are each page's own; Site settings supplies no default.
const onSite = ({ document }) => document?._type === 'site';

export const seoMetaFields = {
  name: 'seoMetaFields',
  title: 'SEO',
  type: 'object',
  components: { input: SeoFeedbackInput },
  fields: [
    {
      name: 'focusKeyphrase',
      title: 'Focus keyphrase',
      type: 'string',
      hidden: onSite,
      description:
        'The search phrase this page should be found for, like "car photography Melbourne". The panel checks it appears where search engines look.'
    },
    {
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      hidden: onSite,
      description: `The title used in search results and browser tabs. Recommended length: ${TITLE_LENGTH.join('-')} characters.`
    },
    {
      name: 'metaDescription',
      title: 'Meta description',
      type: 'string',
      description: `The summary shown under the title in search results. Recommended length: ${DESCRIPTION_LENGTH.join('-')} characters.`
    },
    {
      name: 'nofollowAttributes',
      title: 'Prevent indexing',
      type: 'boolean',
      components: { input: NoIndexInput },
      description:
        'Asks search engines not to index or follow links (adds noindex, nofollow). On a page, Follow Site settings clears it so the Site settings value applies; on Site settings it is the default for every page.'
    },
    {
      name: 'priority',
      title: 'Sitemap priority',
      type: 'number',
      hidden: onSite,
      validation: (Rule) => Rule.min(0).max(1).precision(1),
      description:
        'Leave empty for the default: home 1.0, then 0.2 less for each level down (0.8, 0.6, 0.4, never below 0.2); posts 0.6.'
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
      hidden: ({ document }) => document?._type !== 'site',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'value', title: 'Text value', type: 'string' }
          ],
          preview: { select: { title: 'name', subtitle: 'value' } }
        }
      ],
      description: 'Extra meta tags added to the head of every page.'
    }
  ]
};

export const openGraph = {
  name: 'openGraph',
  title: 'Open Graph',
  type: 'object',
  fields: [
    {
      name: 'image',
      type: 'cloudinaryImage',
      hidden: onSite,
      description: 'Recommended size: 1200x630 pixels.'
    },
    {
      name: 'title',
      type: 'string',
      hidden: onSite,
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
      type: 'string',
      hidden: ({ document }) => document?._type !== 'site',
      description:
        'The site name some platforms show above the title. Leave empty to use the site title.'
    }
  ]
};

const handleRule = (Rule) =>
  Rule.regex(/^@\w{1,15}$/).warning('An @handle, like @rubeanie.');

export const twitter = {
  name: 'twitter',
  title: 'Twitter / X',
  type: 'object',
  fields: [
    {
      name: 'handle',
      title: 'Creator @handle',
      type: 'string',
      description: 'The @handle of the content author.',
      validation: handleRule
    },
    {
      name: 'site',
      type: 'string',
      description: 'The @handle of the website or publisher.',
      validation: handleRule
    }
  ]
};

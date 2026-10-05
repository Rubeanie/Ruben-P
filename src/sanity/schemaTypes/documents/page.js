import { IoMdBrowsers, IoMdEyeOff } from 'react-icons/io';
import {
  MdCallMissedOutgoing,
  MdHomeFilled,
  MdQuestionMark
} from 'react-icons/md';
import { pageBlock } from '../fragments/page-block';
import { metadata } from '../fragments/metadata';
import { headingLinksField } from '../fragments/fields/heading-links';
import { animateModulesField } from '../fragments/fields/animate-modules';

export const page = {
  name: 'page',
  type: 'document',
  icon: IoMdBrowsers,
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
      name: 'modules',
      description: 'Page content',
      group: 'content',
      ...pageBlock
    },
    headingLinksField({ group: 'options' }),
    animateModulesField,
    {
      ...metadata(),
      group: 'seo'
    }
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'metadata.slug.current',
      media: 'metadata.seo.openGraph.image',
      noindex: 'metadata.seo.nofollowAttributes'
    },
    prepare: ({ title, slug, media, noindex }) => ({
      title,
      subtitle: slug,
      media:
        media ||
        (slug === '/' && MdHomeFilled) ||
        (slug === '404' && MdQuestionMark) ||
        (slug === 'redirect' && MdCallMissedOutgoing) ||
        (noindex && IoMdEyeOff)
    })
  }
};

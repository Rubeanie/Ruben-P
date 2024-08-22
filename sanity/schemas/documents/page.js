import { IoMdBrowsers, IoMdEyeOff} from 'react-icons/io';
import { MdHomeFilled, MdQuestionMark } from 'react-icons/md';
import { pageBlock } from '../fragments/page-block';
import { metadata } from '../fragments/metadata';

export const page = {
  name: 'page',
  type: 'document',
  icon: IoMdBrowsers,
  groups: [
    { name: 'content', default: true },
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
      subtitle: slug && (slug === 'index' ? '/' : `/${slug}`),
      media:
        media ||
        (slug === 'index' && MdHomeFilled) ||
        (slug === '404' && MdQuestionMark) ||
        (noindex && IoMdEyeOff)
    })
  }
};

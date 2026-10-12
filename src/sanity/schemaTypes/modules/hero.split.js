import { MdArtTrack } from 'react-icons/md';
import { getBlockText } from '@/sanity/utils';
import { textBlock } from '../fragments/text-block';
import { scrollHintField } from '../fragments/fields/scroll-hint';
import { uidField } from '../fragments/fields/uid';
import { assetPreview } from '../../components/CloudinaryPreview';

export const heroSplit = {
  name: 'hero.split',
  title: 'Hero (Split)',
  icon: MdArtTrack,
  type: 'object',
  groups: [
    { name: 'content', default: true },
    { name: 'image' },
    { name: 'options' }
  ],
  fields: [
    {
      name: 'pretitle',
      type: 'string'
    },
    {
      name: 'content',
      ...textBlock
    },
    {
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }]
    },
    {
      name: 'image',
      type: 'cloudinaryImage',
      group: 'image'
    },
    {
      name: 'imageAlt',
      title: 'Alt text',
      type: 'string',
      group: 'image'
    },
    {
      name: 'imageOnRight',
      title: 'Image on right',
      type: 'boolean',
      initialValue: false,
      group: 'image'
    },
    scrollHintField({ initialValue: false, group: 'options' }),
    uidField({ group: 'options' })
  ],
  preview: {
    select: {
      content: 'content',
      asset: 'image.asset'
    },
    prepare: ({ content, asset }) => ({
      title: getBlockText(content),
      subtitle: 'Hero (Split)',
      media: assetPreview(asset)
    })
  }
};

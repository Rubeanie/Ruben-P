import { MdPhotoSizeSelectActual } from 'react-icons/md';
import { getBlockText } from '@/sanity/utils';
import { textBlock } from '../fragments/text-block';
import { scrollHintField } from '../fragments/fields/scroll-hint';
import { uidField } from '../fragments/fields/uid';
import { assetPreview } from '../../components/CloudinaryPreview';

export const heroSaas = {
  name: 'hero.saas',
  title: 'Hero (Glass)',
  icon: MdPhotoSizeSelectActual,
  type: 'object',
  groups: [
    { name: 'content', default: true },
    { name: 'image' },
    { name: 'options' }
  ],
  fields: [
    {
      name: 'pretitle',
      type: 'string',
      group: 'content'
    },
    {
      name: 'content',
      ...textBlock,
      group: 'content'
    },
    {
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'content'
    },
    {
      name: 'image',
      type: 'cloudinaryImage',
      description: 'The photo the hero and its colours come from',
      validation: (Rule) => Rule.required(),
      group: 'image'
    },
    {
      name: 'imageAlt',
      title: 'Alt text',
      type: 'string',
      group: 'image'
    },
    scrollHintField({ initialValue: true, group: 'options' }),
    uidField({ group: 'options' })
  ],
  preview: {
    select: {
      content: 'content',
      asset: 'image.asset'
    },
    prepare: ({ content, asset }) => ({
      title: getBlockText(content),
      subtitle: 'Hero (Glass)',
      media: assetPreview(asset)
    })
  }
};

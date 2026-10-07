import { MdVrpano } from 'react-icons/md';
import { getBlockText } from '@/sanity/utils';
import { textBlock } from '../fragments/text-block';
import { scrollHintField } from '../fragments/fields/scroll-hint';
import { uidField } from '../fragments/fields/uid';
import { assetPreview } from '../../components/CloudinaryPreview';

export const hero = {
  name: 'hero',
  icon: MdVrpano,
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
      name: 'bgImage',
      title: 'Background Image',
      type: 'cloudinaryImage',
      group: 'image'
    },
    {
      name: 'bgImageAlt',
      title: 'Background Image alt text',
      type: 'string',
      group: 'image'
    },
    scrollHintField({ initialValue: true, group: 'options' }),
    uidField({ group: 'options' })
  ],
  preview: {
    select: {
      content: 'content',
      asset: 'bgImage.asset'
    },
    prepare: ({ content, asset }) => ({
      title: getBlockText(content),
      subtitle: 'Hero',
      media: assetPreview(asset)
    })
  }
};

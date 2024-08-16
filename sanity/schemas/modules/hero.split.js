import { MdArtTrack } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '../fragments/text-block';

export const heroSplit = {
  name: 'hero.split',
	title: 'Hero (Split)',
  icon: MdArtTrack,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'image' }],
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
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string'
        },
        {
          name: 'onRight',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'loading',
          type: 'string',
          options: {
            layout: 'radio',
            list: ['lazy', 'eager']
          },
          initialValue: 'lazy'
        }
      ],
      group: 'image'
    }
  ],
  preview: {
    select: {
      content: 'content',
      media: 'image.asset',
    },
    prepare: ({ content, media }) => ({
      title: getBlockText(content),
      subtitle: 'Hero (Split)',
      media
    })
  }
};
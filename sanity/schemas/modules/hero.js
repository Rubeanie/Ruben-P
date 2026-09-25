import { MdVrpano } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '../fragments/text-block';
import { scrollHintField } from '../fragments/fields/scroll-hint';

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
    },
    {
      name: 'bgImageMobile',
      title: 'Background Image (Mobile)',
      type: 'image',
      options: {
        hotspot: true
      },
      group: 'image'
    },
    scrollHintField({ initialValue: true, group: 'options' })
  ],
  preview: {
    select: {
      content: 'content',
      media: 'bgImage'
    },
    prepare: ({ content, media }) => ({
      title: getBlockText(content),
      subtitle: 'Hero',
      media
    })
  }
};

import { MdPhotoSizeSelectActual } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '../fragments/text-block';
import { scrollHintField } from '../fragments/fields/scroll-hint';

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
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string'
        }
      ],
      description: 'The photo the hero and its colours come from',
      validation: (Rule) => Rule.required(),
      group: 'image'
    },
    scrollHintField({ initialValue: true, group: 'options' })
  ],
  preview: {
    select: {
      content: 'content',
      media: 'image'
    },
    prepare: ({ content, media }) => ({
      title: getBlockText(content),
      subtitle: 'Hero (Glass)',
      media
    })
  }
};

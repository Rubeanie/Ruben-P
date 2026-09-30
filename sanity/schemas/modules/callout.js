import { MdSmartButton } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { richBlock } from '../fragments/text-block';
import { uidField } from '../fragments/fields/uid';

export const callout = {
  name: 'callout',
  icon: MdSmartButton,
  type: 'object',
  fields: [
    {
      name: 'content',
      type: 'array',
      // Headings and copy only: anything bigger is a rich text module above the callout.
      of: [
        {
          ...richBlock,
          styles: richBlock.styles.filter(({ value }) =>
            ['normal', 'h2', 'h3'].includes(value)
          ),
          lists: []
        }
      ]
    },
    {
      name: 'cta',
      title: 'Call-to-action',
      type: 'array',
      of: [{ type: 'cta' }],
      validation: (Rule) => Rule.max(2)
    },
    {
      name: 'size',
      type: 'string',
      options: {
        list: [
          { title: 'Normal', value: 'normal' },
          { title: 'Large', value: 'large' }
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 'normal'
    },
    uidField()
  ],
  preview: {
    select: {
      content: 'content',
      size: 'size'
    },
    prepare({ content, size }) {
      return {
        title: getBlockText(content),
        subtitle: size === 'large' ? 'Callout · Large' : 'Callout'
      };
    }
  }
};

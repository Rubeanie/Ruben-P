import { MdArticle } from 'react-icons/md';
import { imageBlock } from '../fragments/image-block'
import { getBlockText } from '@sanity/src/utils'

export const richtextModule = {
  name: 'richtext-module',
  title: 'Richtext Module',
  icon: MdArticle,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'content',
      type: 'array',
      of: [
        { type: 'block' },
        imageBlock,
        {
          type: 'code',
          options: {
            withFilename: true
          }
        }
      ],
      group: 'content'
    },
    {
      name: 'tableOfContents',
      type: 'boolean',
      initialValue: false,
      group: 'options'
    },
    {
      name: 'tocPosition',
      type: 'string',
      options: {
        list: ['left', 'right'],
        layout: 'radio'
      },
      hidden: ({ parent }) => !parent?.tableOfContents,
      initialValue: 'right',
      group: 'options'
    }
  ],
  preview: {
    select: {
      content: 'content'
    },
    prepare({ content }) {
      return {
        title: getBlockText(content),
        subtitle: 'Richtext Module'
      };
    }
  }
};
import { MdArticle } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils'
import { textBlock } from '../fragments/text-block';

export const richtextModule = {
  name: 'richtext-module',
  title: 'Richtext Module',
  icon: MdArticle,
  type: 'object',
  fields: [
    {
      name: 'content',
      ...textBlock,
    },
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
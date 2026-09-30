import { MdArticle } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '../fragments/text-block';
import { uidField } from '../fragments/fields/uid';

export const richtextModule = {
  name: 'richtext-module',
  title: 'Richtext Module',
  icon: MdArticle,
  type: 'object',
  fields: [
    {
      name: 'content',
      ...textBlock
    },
    {
      name: 'align',
      title: 'Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Start', value: 'start' },
          { title: 'Centre', value: 'center' }
        ],
        layout: 'radio'
      },
      initialValue: 'start'
    },
    uidField()
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

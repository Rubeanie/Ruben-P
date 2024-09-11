import { MdArticle } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '@sanity/schemas/fragments/text-block';

export const creativeRichtext = {
  name: 'richtext',
  icon: MdArticle,
  type: 'object',
  fields: [
    {
      name: 'content',
      ...textBlock
    }
  ],
  preview: {
    select: {
      content: 'content'
    },
    prepare({ content }) {
      return {
        title: getBlockText(content),
        subtitle: 'Richtext'
      };
    }
  }
};

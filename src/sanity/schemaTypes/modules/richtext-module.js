import { MdArticle } from 'react-icons/md';
import { Heading } from '@sanity/ui';
import { getBlockText } from '@/sanity/utils';
import { richBlock, textBlock } from '../fragments/text-block';
import { uidField } from '../fragments/fields/uid';

const h1Large = {
  title: 'Heading 1, large',
  value: 'h1Large',
  component: (props) => (
    <Heading as='h1' size={5}>
      {props.children}
    </Heading>
  )
};

// Heading 1 titles an article; the large style is the display size for a page that opens on it.
const content = {
  ...textBlock,
  of: textBlock.of.map((type) =>
    type === richBlock
      ? {
          ...richBlock,
          styles: richBlock.styles.flatMap((style) =>
            style.value === 'h1' ? [style, h1Large] : style
          )
        }
      : type
  )
};

export const richtextModule = {
  name: 'richtext-module',
  title: 'Richtext Module',
  icon: MdArticle,
  type: 'object',
  fields: [
    {
      name: 'content',
      ...content
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

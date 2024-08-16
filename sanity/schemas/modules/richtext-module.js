import { MdArticle, MdOutlineImage } from 'react-icons/md';
import { imageBlock } from '../fragments/image-block'
import { getBlockText } from '@sanity/src/utils'

const ImageDecorator = (props) => (
  <span className='img-heading'>{props.children}</span>
);

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
        {
          type: 'block',
          styles: [
            { title: 'Heading 1', value: 'h1' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Normal', value: 'normal' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
              {
                title: 'Image Heading',
                value: 'imgHeading',
                icon: MdOutlineImage,
                component: ImageDecorator
              }
            ]
          }
        },
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
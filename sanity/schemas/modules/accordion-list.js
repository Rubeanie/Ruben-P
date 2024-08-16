import { getBlockText } from "@sanity/src/utils";
import { MdQuestionMark } from "react-icons/md";

export const accordionList = {
  name: 'accordion-list',
  type: 'object',
  icon: MdQuestionMark,
  group: [
    { name: 'content', default: true },
    { name: 'options' }
  ],
  fields: [
    {
      name: 'intro',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content'
    },
    {
      name: 'items',
      type: 'array',
      of: [
        {
          type: 'object',
          icon: MdQuestionMark,
          fields: [
            {
              name: 'summary',
              type: 'string'
            },
            {
              name: 'content',
              type: 'array',
              of: [{ type: 'block' }]
            },
            {
              name: 'open',
              type: 'boolean',
              initialValue: false
            }
          ],
          preview: {
            select: {
              title: 'summary',
              content: 'content'
            },
            prepare({ title, content }) {
              return {
                title,
                subtitle: getBlockText(content)
              }
            }
          }
        }
      ],
      group: 'content'
    },
    {
      name: 'layout',
      type: 'string',
      options: {
        layout: 'radio',
        list: [ 'vertical', 'horizontal' ]
      },
      initialValue: 'vertical',
      group: 'options'
    },
    {
      name: 'uid',
      title: 'Unique Identifier',
      type: 'uid',
      group: 'options'
    }
  ],
  preview: {
    select: {
      intro: 'intro'
    },
    prepare({ intro }) {
      return {
        title: getBlockText(intro),
        subtitle: 'Accordion List'
      }
    }
  }
}
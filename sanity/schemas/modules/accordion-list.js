import { getBlockText } from "@sanity/src/utils";
import { MdQuestionMark } from "react-icons/md";
import { textBlock } from "../fragments/text-block";

export const accordionList = {
  name: 'accordion-list',
  type: 'object',
  icon: MdQuestionMark,
  groups: [
    { name: 'content', default: true },
    { name: 'options' }
  ],
  fields: [
    {
      name: 'intro',
      ...textBlock,
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
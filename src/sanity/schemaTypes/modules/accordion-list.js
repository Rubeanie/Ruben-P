import { getBlockText } from '@/sanity/utils';
import { MdQuestionMark } from 'react-icons/md';
import { linkAnnotation } from '../fragments/text-block';
import { uidField } from '../fragments/fields/uid';

export const accordionList = {
  name: 'accordion-list',
  type: 'object',
  icon: MdQuestionMark,
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
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
              title: 'Question',
              type: 'string',
              validation: (Rule) =>
                Rule.required().warning(
                  'Without a question the row is not shown'
                )
            },
            {
              name: 'content',
              title: 'Answer',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [{ title: 'Normal', value: 'normal' }],
                  marks: { annotations: [linkAnnotation] }
                }
              ]
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
              };
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
        list: ['vertical', 'horizontal']
      },
      initialValue: 'vertical',
      group: 'options'
    },
    {
      name: 'multiple',
      title: 'Allow several open',
      type: 'boolean',
      initialValue: false,
      group: 'options'
    },
    uidField({ group: 'options' })
  ],
  preview: {
    select: {
      subtitle: 'items.0.summary'
    },
    prepare({ subtitle }) {
      return {
        title: 'Accordion list',
        subtitle: subtitle ?? 'No items'
      };
    }
  }
};

import { IoMdStats } from 'react-icons/io';
import { textAlign } from '../fragments/fields/alignment';
import { count } from '@/sanity/utils';
import { uidField } from '../fragments/fields/uid';

export const statList = {
  name: 'stat-list',
  title: 'Stat list',
  icon: IoMdStats,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'stats',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'Big figure. Numbers count up, e.g. 50, $12k, 1,200.'
            },
            {
              name: 'subValue',
              title: 'Unit',
              type: 'string',
              description: 'Small text after the value, e.g. years, /10.'
            },
            {
              name: 'text',
              title: 'Label',
              type: 'string',
              description: 'Shown under the value.'
            }
          ],
          preview: {
            select: {
              value: 'value',
              subValue: 'subValue',
              subtitle: 'text'
            },
            prepare({ value, subValue, subtitle }) {
              return {
                title: [value, subValue].filter(Boolean).join(' '),
                subtitle
              };
            }
          }
        }
      ],
      group: 'content'
    },
    {
      ...textAlign,
      group: 'options'
    },
    uidField({ group: 'options' })
  ],
  preview: {
    select: {
      stats: 'stats'
    },
    prepare({ stats }) {
      return {
        title: 'Stat list',
        subtitle: count(stats, 'stat')
      };
    }
  }
};

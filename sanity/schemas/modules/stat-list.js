import { IoMdStats } from 'react-icons/io';
import { textAlign } from '../fragments/fields/alignment';
import { count } from '@sanity/src/utils';

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
              type: 'string'
            },
            {
              name: 'subValue',
              type: 'string'
            },
            {
              name: 'text',
              type: 'string'
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
    }
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

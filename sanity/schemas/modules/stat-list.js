import { IoMdStats } from "react-icons/io";
import { textAlign } from "../fragments/fields/alignment";
import { count, getBlockText } from "@sanity/src/utils";

export const statList = {
  name: 'stat-list',
  title: 'Stat list',
  icon: IoMdStats,
  type: 'Object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'intro',
      ...textBlock,
      group: 'content'
    },
    {
      name: 'stats',
      array: 'array',
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
              }
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
      intro: 'intro',
      stats: 'stats'
    },
    prepare({ intro, stats }) {
      return {
        title: getBlockText(intro) || count(stats, 'stat'),
        subtitle: 'Stat list'
      }
    }
  }
}
import { MdExtension, MdViewColumn } from 'react-icons/md';
import { count } from '@sanity/src/utils';
import { blocks, blockTitles } from './blocks';
import { uidField } from '../../fragments/fields/uid';

const column = {
  name: 'column',
  type: 'object',
  icon: MdViewColumn,
  fields: [
    {
      name: 'blocks',
      type: 'array',
      of: blocks,
      validation: (Rule) => Rule.required().min(1)
    }
  ],
  preview: {
    select: { blocks: 'blocks' },
    prepare({ blocks }) {
      return {
        title:
          (blocks ?? []).map(({ _type }) => blockTitles[_type]).join(' + ') ||
          'Empty column'
      };
    }
  }
};

export const creativeModule = {
  name: 'creative-module',
  title: 'Creative module',
  icon: MdExtension,
  type: 'object',
  fields: [
    {
      name: 'columns',
      type: 'array',
      of: [column],
      validation: (Rule) => Rule.required().min(1)
    },
    uidField()
  ],
  preview: {
    select: { columns: 'columns' },
    prepare({ columns }) {
      return {
        title: 'Creative module',
        subtitle: count(columns, 'column')
      };
    }
  }
};

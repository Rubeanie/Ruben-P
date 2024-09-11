import { IoMdHammer } from 'react-icons/io';
import { textBlock } from '../fragments/text-block';
import { getBlockText } from '@sanity/src/utils';

export const skillList = {
  name: 'skill-list',
  title: 'Skill list',
  icon: IoMdHammer,
  type: 'object',
  fields: [
    {
      name: 'intro',
      ...textBlock
    },
    {
      name: 'skills',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'skill' }] }]
    }
  ],
  preview: {
    select: {
      intro: 'intro'
    },
    prepare({ intro }) {
      return {
        title: getBlockText(intro),
        subtitle: 'Skill list'
      };
    }
  }
};

import { MdAccountCircle } from 'react-icons/md';
import { textBlock } from '../fragments/text-block';
import { getBlockText } from '@sanity/src/utils';

export const socialList = {
  name: 'social-list',
  title: 'Social list',
  icon: MdAccountCircle,
  type: 'object',
  fields: [
    {
      name: 'intro',
      ...textBlock,
    },
    {
      name: 'socials',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'social' }] }],
    },
  ],
  preview: {
    select: {
      intro: 'intro'
    },
    prepare({ intro }) {
      return {
        title: getBlockText(intro),
        subtitle: 'Social list'
      };
    }
  }
};
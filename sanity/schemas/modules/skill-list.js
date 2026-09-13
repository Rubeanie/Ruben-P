import { IoMdHammer } from 'react-icons/io';
import { count } from '@sanity/src/utils';

export const skillList = {
  name: 'skill-list',
  title: 'Skill list',
  icon: IoMdHammer,
  type: 'object',
  fields: [
    {
      name: 'skills',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'skill' }] }]
    }
  ],
  preview: {
    select: {
      skills: 'skills'
    },
    prepare({ skills }) {
      return {
        title: 'Skill list',
        subtitle: count(skills, 'skill')
      };
    }
  }
};

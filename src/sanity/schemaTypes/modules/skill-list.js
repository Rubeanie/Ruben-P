import { IoMdHammer } from 'react-icons/io';
import { count } from '@/sanity/utils';
import { uidField } from '../fragments/fields/uid';

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
    },
    uidField()
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

import { count } from '@sanity/src/utils';
import { MdLinearScale } from 'react-icons/md';

export const breadcrumbs = {
  name: 'breadcrumbs',
  icon: MdLinearScale,
  type: 'object',
  fields: [
    {
      name: 'mode',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Auto', value: 'auto' },
          { title: 'Manual', value: 'manual' }
        ]
      },
      initialValue: 'auto'
    },
    {
      name: 'crumbs',
      type: 'array',
      of: [{ type: 'link', initialValue: { type: 'internal' } }],
      hidden: ({ parent }) => (parent?.mode ?? 'auto') === 'auto',
      description: 'Home and the current page are added automatically.'
    }
  ],
  preview: {
    select: {
      mode: 'mode',
      crumbs: 'crumbs'
    },
    prepare({ mode, crumbs }) {
      return {
        title:
          (mode ?? 'auto') === 'auto'
            ? 'Home › … › Current page'
            : 'Home + ' + count(crumbs, 'crumb') + ' + Current page',
        subtitle: 'Breadcrumbs'
      };
    }
  }
};

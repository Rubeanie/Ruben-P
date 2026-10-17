import { MdAdsClick } from 'react-icons/md';
import { link } from './link';

export const cta = {
  name: 'cta',
  title: 'Call-to-action',
  icon: MdAdsClick,
  type: 'object',
  fields: [
    {
      name: 'link',
      type: 'link'
    },
    {
      name: 'variant',
      type: 'string',
      initialValue: 'action',
      options: {
        list: [
          'action',
          { title: 'Outline', value: 'action-outline' },
          'ghost',
          'link'
        ]
      }
    }
  ],
  preview: {
    select: Object.fromEntries(
      Object.entries(link.preview.select).map(([key, path]) => [
        key,
        `link.${path}`
      ])
    ),
    prepare: link.preview.prepare
  }
};

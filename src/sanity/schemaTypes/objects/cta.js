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
      type: 'link',
      validation: (Rule) =>
        Rule.required().custom((link) =>
          link?.type ? true : 'Pick a link type.'
        )
    },
    {
      name: 'variant',
      type: 'string',
      initialValue: 'action',
      options: {
        list: [
          { title: 'Filled', value: 'action' },
          { title: 'Outline', value: 'action-outline' },
          { title: 'Ghost', value: 'ghost' },
          { title: 'Text link', value: 'link' }
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

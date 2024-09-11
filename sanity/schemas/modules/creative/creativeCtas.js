import { MdAdsClick } from 'react-icons/md';
import { count } from '@sanity/src/utils';

export const creativeCtas = {
  name: 'ctas',
  title: 'Call-to-actions',
  icon: MdAdsClick,
  type: 'object',
  fields: [
    {
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }]
    }
  ],
  preview: {
    select: {
      ctas: 'ctas'
    },
    prepare({ ctas }) {
      return {
        title: count(ctas, 'CTA'),
        subtitle: 'Call-to-actions'
      };
    }
  }
}
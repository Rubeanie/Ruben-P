import { Md3dRotation } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '../fragments/text-block';

export const heroSaas = {
  name: 'hero.saas',
	title: 'Hero (SaaS)',
  icon: Md3dRotation,
  type: 'object',
  fields: [
    {
      name: 'pretitle',
      type: 'string'
    },
    {
      name: 'content',
      ...textBlock
    },
    {
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }]
    },
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare: ({ content }) => ({
      title: getBlockText(content),
      subtitle: 'Hero (SaaS)'
    })
  }
};
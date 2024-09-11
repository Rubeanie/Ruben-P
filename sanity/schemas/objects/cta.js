import { MdAdsClick } from 'react-icons/md';

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
      name: 'style',
      type: 'string',
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
    select: {
      label: 'link.label',
      pageTitle: 'link.internal.title',
      internal: 'link.internal.metadata.slug.current',
      external: 'link.external'
    },
    prepare({ label, pageTitle, internal, external }) {
      return {
        title: label || pageTitle,
        subtitle: external || (internal && (internal === 'index' ? '/' : `/${internal}`))
      }
    }
  }
};

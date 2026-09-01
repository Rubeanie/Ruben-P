import { MdOutlineCallSplit } from 'react-icons/md';

export const redirect = {
  name: 'redirect',
  type: 'document',
  icon: MdOutlineCallSplit,
  fields: [
    {
      name: 'source',
      title: 'Redirect from',
      description: 'Local path to redirect, e.g. /old-path or /old-path/:slug',
      type: 'string',
      validation: (Rule) =>
        Rule.required().regex(/^\//, { name: 'local path starting with /' })
    },
    {
      name: 'destination',
      title: 'Redirect to',
      type: 'link',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'permanent',
      type: 'boolean',
      initialValue: true,
      description:
        '308: clients and search engines cache the redirect forever. Off: 307, temporary and uncached.'
    }
  ],
  preview: {
    select: {
      title: 'source',
      label: 'destination.label',
      external: 'destination.external',
      internal: 'destination.internal.title'
    },
    prepare: ({ title, label, external, internal }) => ({
      title,
      subtitle: `to ${label || internal || external || '?'}`
    })
  }
};

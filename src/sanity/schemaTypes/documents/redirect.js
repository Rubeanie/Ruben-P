import { MdOutlineCallSplit } from 'react-icons/md';
import { apiVersion } from '@/lib/env';

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
      validation: (Rule) => [
        Rule.required()
          .regex(/^(\/[^/\\?#\s]+)+$/)
          .error(
            'A path like /old-page or /old/:slug, with no trailing slash, ? or #.'
          ),
        // A page at the same path is served first, so the redirect would never run.
        Rule.custom(async (source, { getClient }) => {
          if (!source) return true;
          const taken = await getClient({ apiVersion }).fetch(
            `count(*[_type in ['page', 'page.post'] && metadata.slug.current == $source]) > 0`,
            { source }
          );
          return taken ? `A page already has the path ${source}.` : true;
        })
      ]
    },
    {
      name: 'destination',
      title: 'Redirect to',
      type: 'link',
      validation: (Rule) =>
        Rule.required().custom((link) => {
          if (!link?.type) return 'Pick where to redirect to.';
          return link.type === 'redirect'
            ? 'A redirect cannot point at another redirect.'
            : true;
        })
    },
    {
      name: 'permanent',
      type: 'boolean',
      initialValue: true,
      description:
        'Only for destinations on this site. On: 308, browsers and search engines remember the move. Off: 307, temporary. Other destinations always show the redirect screen.'
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

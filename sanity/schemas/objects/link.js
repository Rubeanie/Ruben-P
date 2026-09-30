import { IoMdLink } from 'react-icons/io';
import { apiVersion } from '@/lib/env';
import { decodeFragment } from '@/lib/anchors';
import { LinkInput } from '@sanity/src/components/LinkInput';
import { splitParams, targetAnchors } from '@sanity/src/utils';

export const link = {
  name: 'link',
  type: 'object',
  icon: IoMdLink,
  options: {
    columns: 2
  },
  components: { input: LinkInput },
  fields: [
    {
      name: 'label',
      type: 'string'
    },
    {
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal', value: 'internal' },
          { title: 'External', value: 'external' }
        ]
      }
    },
    {
      name: 'internal',
      type: 'reference',
      to: [
        {
          type: 'page'
        },
        {
          type: 'page.post'
        }
      ],
      // Template pages (404, redirect) have no path to link to.
      options: { filter: 'string::startsWith(metadata.slug.current, "/")' },
      hidden: ({ parent }) => parent?.type !== 'internal'
    },
    {
      name: 'external',
      type: 'url',
      placeholder: 'https://example.com',
      validation: (Rule) =>
        Rule.uri({
          // any scheme except the executable ones; mirrors isSafeHref in
          // src/lib/processUrl.js
          scheme: /^(?!(?:javascript|data|vbscript|blob|file)$)/i,
          allowRelative: true
        }),
      hidden: ({ parent }) => parent?.type !== 'external'
    },
    {
      name: 'params',
      title: 'URL parameters',
      placeholder: 'e.g. #jump-link or ?foo=bar',
      type: 'string',
      validation: (Rule) => [
        Rule.regex(/^[?#]/, { name: 'query or fragment' }).error(
          'Start with ? or #.'
        ),
        Rule.custom(async (params, { parent, getClient }) => {
          const { fragment } = splitParams(params);
          const ref = parent?.type === 'internal' && parent.internal?._ref;
          if (!fragment || !ref) return true;
          const id = decodeFragment(fragment);
          if (id === null) return `#${fragment} is not a valid fragment.`;
          // The live page: a heading that exists only in a draft misses.
          const target = await targetAnchors(
            getClient({ apiVersion }),
            ref,
            'published'
          );
          if (!target || target.ids.has(id)) return true;
          return `No heading #${fragment} on ${target.title}. The link opens the page at the top.`;
        }).warning()
      ],
      hidden: ({ parent }) => !parent?.type
    }
  ],
  preview: {
    select: {
      label: 'label',
      title: 'internal.title',
      slug: 'internal.metadata.slug.current',
      external: 'external',
      params: 'params'
    },
    prepare({ label, title, slug, external, params }) {
      return {
        title: label || title,
        subtitle: [external || slug, params].filter(Boolean).join('')
      };
    }
  }
};

import { IoMdLink } from 'react-icons/io';
import { apiVersion } from '@/lib/env';
import { decodeFragment } from '@/lib/anchors';
import { isSafeHref } from '@/lib/processUrl';
import { LinkInput } from '@/sanity/components/LinkInput';
import { splitParams, targetAnchors } from '@/sanity/utils';

const requiredFor = (type, message) => (Rule) =>
  Rule.custom((value, { parent }) =>
    parent?.type === type && !value ? message : true
  );

// Hidden fields keep their values, so each check only runs for the active
// type; otherwise a stale value would block publishing.
const validUrl = (url) => {
  try {
    new URL(url, 'https://relative.invalid');
  } catch {
    return 'Enter a valid URL.';
  }
  return isSafeHref(url) || 'This kind of link can’t be used.';
};

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
          { title: 'External', value: 'external' },
          { title: 'Redirect', value: 'redirect' }
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
      validation: requiredFor('internal', 'Pick a page.'),
      hidden: ({ parent }) => parent?.type !== 'internal'
    },
    {
      name: 'redirect',
      type: 'reference',
      to: [{ type: 'redirect' }],
      // A pattern source (/old/:slug) is no URL to link to.
      options: { filter: 'count(string::split(source, ":")) == 1' },
      validation: requiredFor('redirect', 'Pick a redirect.'),
      hidden: ({ parent }) => parent?.type !== 'redirect'
    },
    {
      name: 'external',
      // A string, not url: url fields add a fixed uri rule that runs even
      // while hidden and refuses app schemes like steam://.
      type: 'string',
      placeholder: 'https://example.com',
      validation: (Rule) =>
        Rule.custom((url, { parent }) => {
          if (parent?.type !== 'external') return true;
          return url ? validUrl(url) : 'Add a URL.';
        }),
      hidden: ({ parent }) => parent?.type !== 'external'
    },
    {
      name: 'params',
      title: 'URL parameters',
      placeholder: 'e.g. #jump-link or ?foo=bar',
      type: 'string',
      validation: (Rule) => [
        Rule.custom((params, { parent }) =>
          parent?.type !== 'internal' || !params || /^[?#]/.test(params)
            ? true
            : 'Start with ? or #.'
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
          return `No heading #${fragment} on the published page “${target.title}”. Until there is one, the link opens the page at the top.`;
        }).warning()
      ],
      hidden: ({ parent }) => parent?.type !== 'internal'
    }
  ],
  preview: {
    select: {
      label: 'label',
      title: 'internal.title',
      slug: 'internal.metadata.slug.current',
      external: 'external',
      redirect: 'redirect.source',
      redirectLabel: 'redirect.destination.label',
      redirectTitle: 'redirect.destination.internal.title',
      params: 'params'
    },
    prepare({
      label,
      title,
      slug,
      external,
      redirect,
      redirectLabel,
      redirectTitle,
      params
    }) {
      return {
        title:
          label ||
          title ||
          external ||
          redirectLabel ||
          redirectTitle ||
          redirect,
        subtitle: [external || slug || redirect, params]
          .filter(Boolean)
          .join('')
      };
    }
  }
};

import { MdOutlineCallSplit } from 'react-icons/md';

export const redirect = {
  name: 'redirect',
  type: 'document',
  icon: MdOutlineCallSplit,
  fields: [
    {
      name: 'source',
      title: 'Redirect from',
      placeholder: 'e.g. /old-path, /old-path/:slug',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'destination',
      title: 'Redirect to',
      placeholder: 'e.g. /new-path, /new-path/:slug',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'permanent',
      type: 'boolean',
      initialValue: true,
      description: (
        <>
          <p>
            If <code>true</code> will use the 308 status code which instructs
            clients/search engines to cache the redirect forever, if{' '}
            <code>false</code> will use the 307 status code which is temporary
            and is not cached.
          </p>
          <p>
            <a
              href='https://nextjs.org/docs/app/api-reference/next-config-js/redirects'
              target='_blank'>
              Next.js redirects documentation
            </a>
          </p>
        </>
      )
    }
  ],
  preview: {
    select: {
      title: 'source',
      destination: 'destination'
    },
    prepare: ({ title, destination }) => ({
      title,
      subtitle: `to ${destination}`
    })
  }
};

import { MdDataObject } from 'react-icons/md';

export const dynamicValue = {
  name: 'dynamicValue',
  title: 'Dynamic value',
  icon: MdDataObject,
  type: 'object',
  fields: [
    {
      name: 'source',
      type: 'string',
      description:
        'Filled in by the page at request time; shows the fallback elsewhere',
      options: {
        list: [{ title: 'Redirect destination', value: 'redirect.destination' }]
      },
      validation: (Rule) => Rule.required()
    },
    {
      name: 'presentation',
      type: 'string',
      initialValue: 'text',
      options: {
        layout: 'radio',
        list: [
          { title: 'Text', value: 'text' },
          { title: 'Link', value: 'link' }
        ]
      }
    },
    {
      name: 'fallback',
      type: 'string',
      description: 'Shown when the page has no value for this source'
    }
  ],
  preview: {
    select: { source: 'source', presentation: 'presentation' },
    prepare({ source, presentation }) {
      return { title: source ?? 'Dynamic value', subtitle: presentation };
    }
  }
};

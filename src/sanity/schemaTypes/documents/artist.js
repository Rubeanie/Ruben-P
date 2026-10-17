import { MdBrush } from 'react-icons/md';
import { uniqueName } from '../fragments/unique-name';

export const artist = {
  name: 'artist',
  title: 'Artist',
  type: 'document',
  icon: MdBrush,
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: uniqueName
    },
    {
      name: 'link',
      type: 'link',
      description:
        'Where the credit leads: a web address, or an email as mailto:name@example.com.',
      options: { types: ['external'] },
      initialValue: { type: 'external' },
      validation: (Rule) =>
        Rule.custom((value) => {
          const url = value?.external;
          if (value?.type && value.type !== 'external')
            return 'Artist links go to a web address or an email.';
          if (!url) return true;
          if (/^(https?:|mailto:)/i.test(url)) return true;
          if (/^[^\s@/:]+@[^\s@/]+$/.test(url))
            return 'Add mailto: in front of the email address.';
          return 'Use a web address (https://) or an email (mailto:).';
        })
    }
  ],
  preview: {
    select: { title: 'name' }
  }
};

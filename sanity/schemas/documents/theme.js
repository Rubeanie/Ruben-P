/* eslint-disable @next/next/no-img-element */
import { MdStyle } from 'react-icons/md';
import { count } from '../../src/utils';

export const theme = {
  name: 'theme',
  type: 'document',
  icon: MdStyle,
  fields: [
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'styles',
      type: 'array',
      of: [{ type: 'styleType' }],
      validation: (Rule) => Rule.required().min(1)
    }
  ],
  preview: {
    select: {
      title: 'title',
      styles: 'styles',
      url: 'styles[0].image.secure_url'
    },
    prepare(selection) {
      const { title, styles, url } = selection;
      return {
        title,
        subtitle: count(styles, 'style'),
        media:
          url !== undefined ? (
            <img
              src={url}
              alt='Style Preview Image'
              style={{ height: '100%', width: 'auto', display: 'block' }}
            />
          ) : null
      };
    }
  }
};

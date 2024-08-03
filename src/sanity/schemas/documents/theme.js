/* eslint-disable @next/next/no-img-element */
import { MdStyle } from 'react-icons/md';

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
      /* min value 1 using min(minLength) */
      validation: (Rule) => Rule.required().min(5)
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
        title: title,
        subtitle: `${styles.length} styles`,
        media: (
          <img
            src={url}
            alt='Style Preview Image'
            style={{ height: '100%', width: 'auto', display: 'block' }}
          />
        )
      };
    }
  }
};

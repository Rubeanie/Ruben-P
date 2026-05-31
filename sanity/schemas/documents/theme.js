/* eslint-disable @next/next/no-img-element */
import { MdStyle } from 'react-icons/md';

function getStylesSubtitle(styles = []) {
  const styleCount = Array.isArray(styles) ? styles.length : 0;

  return `${styleCount} style${styleCount === 1 ? '' : 's'}`;
}

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
      of: [{ type: 'style' }],
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
        subtitle: getStylesSubtitle(styles),
        media:
          url !== undefined ? (
            <img
              src={url}
              alt='Style Preview Image'
              style={{
                height: '100%',
                width: 'auto',
                display: 'block',
                left: 'unset'
              }}
            />
          ) : null
      };
    }
  }
};

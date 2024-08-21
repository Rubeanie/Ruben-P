import { MdVerified } from 'react-icons/md';
import { InlineSvgPreviewItem } from '@focus-reactive/sanity-plugin-inline-svg-input';

export const creativeIcon = {
  name: 'icon',
  icon: MdVerified,
  type: 'object',
  fields: [
    {
      name: 'alt',
      type: 'string'
    },
    {
      name: 'icon',
      type: 'inlineSvg'
    },
    {
      name: 'size',
      type: 'number',
      description: 'rem, leave blank for default size',
      validation: (Rule) => Rule.min(1).integer()
    }
  ],
  preview: {
    select: {
      title: 'alt',
      icon: 'icon'
    }
  },
  components: {
    preview({ title, icon }) {
      return (
        <InlineSvgPreviewItem title={title} subtitle="Icon" icon={icon} />
      );
    }
  }
};
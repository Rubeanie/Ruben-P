import { MdAccountCircle } from 'react-icons/md';
import { InlineSvgPreviewComponent } from '@focus-reactive/sanity-plugin-inline-svg-input';
import { DEFAULT_THEME_COLORS } from '@/lib/themes';

export const PreviewComponent = ({ logo, backgroundColor }) => {
  return (
    <InlineSvgPreviewComponent
      value={logo}
      style={{ backgroundColor: backgroundColor?.hex }}
      className='social-svg'
    />
  );
};

export const social = {
  name: 'social',
  icon: MdAccountCircle,
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'username',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'logo',
      type: 'inlineSvg'
    },
    {
      name: 'baseColor',
      title: 'Brand colour',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: [{ hex: DEFAULT_THEME_COLORS.primary }]
      }
    },
    {
      name: 'redirect',
      description:
        'The social’s vanity redirect (e.g. /socials/discord to the profile). Cards link straight to the page when it points at one, otherwise through its path.',
      type: 'reference',
      to: [{ type: 'redirect' }],
      validation: (Rule) =>
        Rule.required().warning('No redirect, so the card links nowhere.')
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'username',
      logo: 'logo',
      baseColor: 'baseColor'
    },
    prepare({ title, subtitle, logo, baseColor }) {
      return {
        title,
        subtitle,
        media: <PreviewComponent logo={logo} backgroundColor={baseColor} />
      };
    }
  }
};

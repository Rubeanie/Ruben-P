import { MdAccountCircle } from 'react-icons/md';
import { InlineSvgPreviewComponent } from '@focus-reactive/sanity-plugin-inline-svg-input';

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
      title: 'Brand color',
      type: 'color',
      options: {
        colorList: [{ hex: '#ed5f68' }]
      }
    },
    {
      name: 'redirect',
      description:
        "The social's vanity redirect (e.g. /socials/discord → the profile). Cards link to its source path, so the redirect is the single owner of the destination URL.",
      type: 'reference',
      to: [{ type: 'redirect' }],
      validation: (Rule) => Rule.required().warning()
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

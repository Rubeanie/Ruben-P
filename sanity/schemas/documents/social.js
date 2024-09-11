import { MdAccountCircle } from 'react-icons/md';
import { InlineSvgPreviewComponent } from '@focus-reactive/sanity-plugin-inline-svg-input';
import { slug } from '../fragments/slug';

export const PreviewComponent = ({ logo, foregroundColor, backgroundColor }) => {
  return (
    <InlineSvgPreviewComponent
      value={logo}
      style={{
        color: foregroundColor?.hex,
        backgroundColor: backgroundColor?.hex
      }}
      className='social-svg'
    />
  );
};

export const social = {
  name: 'social',
  icon: MdAccountCircle,
  type: 'document',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'username',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'logo',
      type: 'inlineSvg',
      group: 'content'
    },
    {
      name: 'baseColor',
      title: 'Brand color',
      type: 'color',
      options: {
        colorList: [{ hex: '#ed5f68' }]
      },
      group: 'content'
    },
    {
      name: 'textColor',
      title: 'Text color',
      type: 'color',
      options: {
        colorList: [{ hex: '#121212' }]
      },
      group: 'options'
    },
    {
      name: 'url',
      title: 'URL',
      type: 'link',
      group: 'options'
    },
    {
      ...slug('socials/'),
      group: 'options'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'username',
      logo: 'logo',
      textColor: 'textColor',
      baseColor: 'baseColor'
    },
    prepare({ title, subtitle, logo, textColor, baseColor }) {
      return {
        title,
        subtitle,
        media: (
          <PreviewComponent
            logo={logo}
            foregroundColor={textColor}
            backgroundColor={baseColor}
          />
        )
      };
    }
  }
};

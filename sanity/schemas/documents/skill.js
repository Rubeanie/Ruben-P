import { IoMdHammer } from 'react-icons/io';
import { InlineSvgPreviewComponent } from '@focus-reactive/sanity-plugin-inline-svg-input';

export const PreviewComponent = ({
  logo,
  foregroundColor,
  backgroundColor
}) => {
  return (
    <InlineSvgPreviewComponent
      value={logo}
      style={{
        color: foregroundColor?.hex,
        backgroundColor: backgroundColor?.hex
      }}
      className='skill-svg'
    />
  );
};

export const skill = {
  name: 'skill',
  icon: IoMdHammer,
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
    }
  ],
  preview: {
    select: {
      title: 'title',
      logo: 'logo',
      textColor: 'textColor',
      baseColor: 'baseColor'
    },
    prepare({ title, logo, textColor, baseColor }) {
      return {
        title,
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

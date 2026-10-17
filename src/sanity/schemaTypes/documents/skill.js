import { IoMdHammer } from 'react-icons/io';
import { InlineSvgPreviewComponent } from '@focus-reactive/sanity-plugin-inline-svg-input';
import { DEFAULT_THEME_COLORS } from '@/lib/themes';

export const PreviewComponent = ({ logo, backgroundColor }) => {
  return (
    <InlineSvgPreviewComponent
      value={logo}
      style={{
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
      title: 'Brand colour',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: [{ hex: DEFAULT_THEME_COLORS.primary }]
      },
      group: 'content'
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
      baseColor: 'baseColor'
    },
    prepare({ title, logo, baseColor }) {
      return {
        title,
        media: <PreviewComponent logo={logo} backgroundColor={baseColor} />
      };
    }
  }
};

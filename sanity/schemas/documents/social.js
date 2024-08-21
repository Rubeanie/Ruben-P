import { MdAccountCircle } from 'react-icons/md';
import { InlineSvgPreviewComponent } from '@focus-reactive/sanity-plugin-inline-svg-input';

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
      name: 'platform',
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
      name: 'slug',
      type: 'slug',
      description: 'URL path / permalink. Use "index" for the home page.',
      options: {
        source: (doc) => `socials/${doc.platform}`,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .slice(0, 200)
            .replace(/[&\\#,+()$~%.'":*?<>{}]/g, '')
      },
      validation: (Rule) => Rule.required(),
      group: 'options'
    }
  ],
  preview: {
    select: {
      title: 'platform',
      subtitle: 'username',
      logo: 'logo',
      baseColor: 'baseColor',
      textColor: 'textColor'
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
  },
  orderings: [
    {
      title: 'Title',
      name: 'title',
      by: [{ field: 'platform', direction: 'asc' }]
    }
  ]
};

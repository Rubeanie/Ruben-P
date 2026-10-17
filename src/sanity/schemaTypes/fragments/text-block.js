import { MdOutlineImage } from 'react-icons/md';
import { imageBlock } from './image-block';
import { youTubeBlock } from './youTubeBlock';
import { otDecorators } from './ot-decorators';

// Styled in styles/sanity.scss so the photo URL lives in one place with the site's.
const ImageDecorator = (props) => (
  <span className='image-heading'>{props.children}</span>
);

// The site's link object, so a prose link resolves like a CTA. Not named
// 'link': an annotation cannot share the name of the type it extends.
export const linkAnnotation = {
  name: 'linkMark',
  type: 'link',
  validation: (Rule) =>
    Rule.custom((link) => (link?.type ? true : 'Pick a link type.'))
};

export const richBlock = {
  type: 'block',
  of: [{ type: 'dynamicValue' }],
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'Heading 1', value: 'h1' },
    { title: 'Heading 2', value: 'h2' },
    { title: 'Heading 3', value: 'h3' },
    { title: 'Quote', value: 'blockquote' }
  ],
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Italic', value: 'em' },
      { title: 'Code', value: 'code' },
      { title: 'Underline', value: 'underline' },
      { title: 'Strike', value: 'strike-through' },
      {
        title: 'Image Heading',
        value: 'imgHeading',
        icon: MdOutlineImage,
        component: ImageDecorator
      },
      ...otDecorators
    ],
    annotations: [linkAnnotation]
  }
};

// Heroes and beats render text only: no lists, and only the styles they show.
// Heroes keep their text decorators (imgHeading, ss01...) on purpose.
const plainBlock = {
  ...richBlock,
  lists: []
};

export const heroText = {
  type: 'array',
  of: [
    {
      ...plainBlock,
      styles: richBlock.styles.filter(({ value }) =>
        ['normal', 'h1'].includes(value)
      )
    }
  ]
};

// A beat shows its first h2 and first paragraph, unstyled.
export const beatText = {
  type: 'array',
  of: [
    {
      ...plainBlock,
      of: [],
      styles: richBlock.styles.filter(({ value }) =>
        ['normal', 'h2'].includes(value)
      ),
      marks: { decorators: [], annotations: [] }
    }
  ],
  validation: (Rule) => [
    Rule.max(2),
    Rule.custom((blocks) => {
      const count = (style) =>
        blocks?.filter((block) => block.style === style).length ?? 0;
      return count('h2') > 1 || count('normal') > 1
        ? 'A beat shows one Heading 2 and one paragraph; extra blocks are not shown.'
        : true;
    })
  ]
};

export const textBlock = {
  type: 'array',
  of: [
    richBlock,
    youTubeBlock,
    imageBlock,
    {
      type: 'code',
      options: {
        withFilename: true
      }
    }
  ]
};

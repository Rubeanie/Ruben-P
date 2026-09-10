import { MdOutlineImage } from 'react-icons/md';
import { imageBlock } from './image-block';
import { youTubeBlock } from './youTubeBlock';
import { otDecorators } from './ot-decorators';

// Styled in styles/sanity.scss so the photo URL lives in one place with the site's.
const ImageDecorator = (props) => (
  <span className='image-heading'>{props.children}</span>
);

export const textBlock = {
  type: 'array',
  of: [
    {
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
        ]
      }
    },
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

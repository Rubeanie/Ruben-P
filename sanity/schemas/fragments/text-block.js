import { MdOutlineImage } from 'react-icons/md';
import { imageBlock } from './image-block';
import { youTubeBlock } from './youTubeBlock';

const ImageDecorator = (props) => (
  <span className='image-text'>{props.children}</span>
);

export const textBlock = {
  type: 'array',
  of: [
    {
      type: 'block',
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
          }
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

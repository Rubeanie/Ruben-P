import { MdOutlineImage } from 'react-icons/md';
import { imageBlock } from './image-block';

const ImageDecorator = (props) => (
  <span className='img-heading'>{props.children}</span>
);

export const textBlock = {
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Heading 1', value: 'h1' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Normal', value: 'normal' },
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
    imageBlock,
    {
      type: 'code',
      options: {
        withFilename: true
      }
    }
  ]
};

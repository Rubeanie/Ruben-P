import { MdImage } from 'react-icons/md';
import { blockLayoutFields } from './fields/block-layout';
import { assetPreview } from '../../components/CloudinaryPreview';
import { imageRequired } from '../objects/cloudinary-image';

export const sourceDescription =
  'Credit link; the caption becomes the link, or reads “Source” without one.';

export const imageBlock = {
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  icon: MdImage,
  fieldsets: [
    { name: 'options', options: { collapsible: true, collapsed: false } }
  ],
  fields: [
    {
      name: 'image',
      type: 'cloudinaryImage',
      validation: imageRequired
    },
    {
      name: 'caption',
      type: 'text',
      rows: 2
    },
    {
      name: 'source',
      type: 'url',
      description: sourceDescription
    },
    {
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'What the image shows, read out by screen readers. Leave empty if it is only decoration.',
      validation: (Rule) =>
        Rule.custom((alt) =>
          alt?.trim()
            ? true
            : 'Without alt text screen readers skip this image. Fine for decoration.'
        ).warning()
    },
    ...blockLayoutFields({ fieldset: 'options' }),
    {
      name: 'loading',
      type: 'string',
      options: {
        list: ['lazy', 'eager']
      },
      initialValue: 'lazy',
      fieldset: 'options'
    }
  ],
  preview: {
    select: {
      title: 'caption',
      subtitle: 'alt',
      asset: 'image.asset'
    },
    prepare: ({ title, subtitle, asset }) => ({
      title,
      subtitle,
      // Sanity Studio preview thumbnail, next/image doesn't run in Studio.
      media: assetPreview(asset, subtitle)
    })
  }
};

import { MdImage } from 'react-icons/md';
import { blockLayoutFields } from './fields/block-layout';
import { assetPreview } from '../../components/CloudinaryPreview';

export const imageBlock = {
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  icon: MdImage,
  fieldsets: [
    { name: 'info', options: { collapsible: true, collapsed: true } },
    { name: 'options', options: { collapsible: true, collapsed: false } }
  ],
  fields: [
    {
      name: 'image',
      type: 'cloudinaryImage',
      validation: (Rule) => Rule.required(),
      fieldset: 'info'
    },
    {
      name: 'caption',
      type: 'text',
      rows: 2,
      fieldset: 'info'
    },
    {
      name: 'alt',
      type: 'string',
      fieldset: 'info'
    },
    {
      name: 'source',
      type: 'url',
      fieldset: 'options'
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

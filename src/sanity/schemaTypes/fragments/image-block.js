import { MdImage } from 'react-icons/md';
import { blockLayoutFields } from './fields/block-layout';
import { clipField } from './fields/clip';
import { CloudinaryPreview } from '../../components/CloudinaryPreview';

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
      name: 'imageType',
      type: 'string',
      title: 'Image Type',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Cloudinary Asset', value: 'cloudinary.asset' }
        ],
        layout: 'radio'
      },
      initialValue: 'image'
    },
    {
      name: 'image',
      type: 'image',
      hidden: ({ parent }) => parent?.imageType !== 'image',
      options: {
        hotspot: true
      },
      fieldset: 'info'
    },
    {
      name: 'cloudinaryAsset',
      type: 'cloudinary.asset',
      title: 'Cloudinary Image',
      hidden: ({ parent }) => parent?.imageType !== 'cloudinary.asset',
      fieldset: 'info'
    },
    { ...clipField, fieldset: 'info' },
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
    },
    {
      name: 'placeholder',
      type: 'string',
      options: {
        list: ['none', 'blur']
      },
      initialValue: 'blur',
      hidden: ({ parent }) => parent?.imageType !== 'cloudinary.asset',
      fieldset: 'options'
    }
  ],
  preview: {
    select: {
      title: 'caption',
      subtitle: 'alt',
      type: 'imageType',
      sanity: 'image',
      cloudinary: 'cloudinaryAsset.secure_url'
    },
    prepare({ title, subtitle, type, sanity, cloudinary }) {
      var media;
      if (type === 'image' && sanity) {
        media = sanity;
      } else if (type === 'cloudinary.asset' && cloudinary) {
        media = (
          // Sanity Studio preview thumbnail, next/image doesn't run in Studio.
          <CloudinaryPreview url={cloudinary} alt={subtitle} />
        );
      } else {
        media = null;
      }

      return {
        title,
        subtitle,
        media
      };
    }
  }
};

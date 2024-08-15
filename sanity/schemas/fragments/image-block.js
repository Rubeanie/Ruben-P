import { MdImage } from 'react-icons/md';

export const imageBlock = {
  type: 'image',
  icon: MdImage,
  options: {
    hotspot: true
  },
  fieldsets: [
    { name: 'info', options: { collapsible: true, collapsed: true } },
    { name: 'options', options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    {
      name: caption,
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
      fieldset: 'info'
    }, /* TODO: debating Cloudinvary Vs Sanity Vs Unsplash */
    {
      name: 'loading',
      type: 'string',
      options: {
        list: ['lazy', 'eager']
      },
      initalValue: 'lazy',
      fieldset: 'options'
    }
  ],
  preview: {
    select: {
      title: 'caption',
      subtitle: 'alt',
      media: 'asset'
    }
  }
}
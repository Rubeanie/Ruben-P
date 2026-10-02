import {
  MdAddPhotoAlternate,
  MdNotes,
  MdPalette,
  MdStars,
  MdTitle
} from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { imageBlock } from '../../fragments/image-block';
import { richBlock } from '../../fragments/text-block';
import { creativeIcons } from '@/components/Modules/CreativeModule/icons';

const iconTitle = (name) =>
  name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

const icon = {
  name: 'icon',
  type: 'object',
  icon: MdStars,
  fields: [
    {
      name: 'icon',
      type: 'string',
      options: {
        list: Object.keys(creativeIcons).map((value) => ({
          title: iconTitle(value),
          value
        }))
      },
      validation: (Rule) => Rule.required()
    }
  ],
  preview: {
    select: { icon: 'icon' },
    prepare({ icon }) {
      return {
        title: icon ? iconTitle(icon) : 'No icon',
        subtitle: 'Icon',
        media: creativeIcons[icon] ?? MdStars
      };
    }
  }
};

const heading = {
  name: 'heading',
  type: 'object',
  icon: MdTitle,
  fields: [
    {
      name: 'text',
      type: 'string',
      validation: (Rule) => Rule.required()
    }
  ],
  preview: {
    select: { title: 'text' },
    prepare({ title }) {
      return { title, subtitle: 'Heading' };
    }
  }
};

const copy = {
  // 'text' is a built-in type name, which an array member may not reuse.
  name: 'copy',
  title: 'Text',
  type: 'object',
  icon: MdNotes,
  fields: [
    {
      name: 'content',
      type: 'array',
      // Copy only: the column's heading is its own block.
      of: [
        {
          ...richBlock,
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: []
        }
      ],
      validation: (Rule) => Rule.required()
    }
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      return { title: getBlockText(content), subtitle: 'Text' };
    }
  }
};

const themeControl = ({ name, title, icon, label, description }) => ({
  name,
  title,
  type: 'object',
  icon,
  fields: [
    {
      name: 'label',
      type: 'string',
      description,
      initialValue: label,
      validation: (Rule) => Rule.required()
    }
  ],
  preview: {
    select: { label: 'label' },
    prepare({ label }) {
      return { title: label, subtitle: title };
    }
  }
});

const themeCycle = themeControl({
  name: 'themeCycle',
  title: 'Next theme button',
  icon: MdPalette,
  label: 'Next theme',
  description:
    'The button’s text. Pressing it steps to the next theme, changing the colours only on the visitor’s device.'
});

const themeImage = themeControl({
  name: 'themeImage',
  title: 'Photo theme drop zone',
  icon: MdAddPhotoAlternate,
  label: 'Choose a photo',
  description:
    'The drop zone’s title. A photo picked or dropped there sets the colours only on the visitor’s device; it is never uploaded.'
});

export const blockTitles = {
  icon: 'Icon',
  heading: 'Heading',
  copy: 'Text',
  imageBlock: 'Image',
  link: 'Link',
  themeCycle: themeCycle.title,
  themeImage: themeImage.title
};

export const blocks = [
  icon,
  heading,
  copy,
  imageBlock,
  { type: 'link' },
  themeCycle,
  themeImage
];

import { IoMdCube } from 'react-icons/io';
import { textBlock } from '../fragments/text-block';
import { getBlockText } from '@sanity/src/utils';

export const threeJs = {
  name: 'three.js',
  title: '3D scene',
  icon: IoMdCube,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'intro',
      ...textBlock,
      group: 'content'
    },
    {
      name: 'model',
      type: 'cloudinary.asset',
      description: 'Must be a GLB file',
      group: 'content'
    },
    {
      name: 'lights',
      type: 'color',
      description: 'Ambient light color',
      group: 'content'
    },
    {
      name: 'background',
      type: 'color',
      description: 'Background color',
      group: 'options'
    },
    {
      name: 'orbitControls',
      type: 'boolean',
      initialValue: true,
      group: 'options'
    },
    {
      name: 'zoom',
      type: 'boolean',
      initialValue: false,
      description: 'Enable zoom',
      hidden: ({ parent }) => parent.orbitControls === false,
      group: 'options'
    }
  ],
  preview: {
    select: {
      intro: 'intro'
    },
    prepare({ intro }) {
      return {
        title: getBlockText(intro),
        subtitle: '3D scene'
      };
    }
  }
};

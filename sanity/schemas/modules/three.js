import { IoMdCube } from 'react-icons/io';
import { blockLayoutFields } from '../fragments/fields/block-layout';

// Grain and vignette ride on the glow's composer, so they only exist with it.
const GLOWING = ['quiet', 'medium'];

export const threeJs = {
  name: 'three.js',
  title: '3D scene',
  icon: IoMdCube,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'modelSource',
      title: 'Model source',
      type: 'string',
      options: {
        list: [
          { title: 'File upload', value: 'file' },
          { title: 'URL', value: 'url' },
          { title: 'Cloudinary', value: 'cloudinary' }
        ],
        layout: 'radio'
      },
      initialValue: 'file',
      group: 'content'
    },
    {
      name: 'modelFile',
      title: 'Model file',
      type: 'file',
      description: 'Upload a GLB file',
      options: { accept: '.glb,model/gltf-binary' },
      hidden: ({ parent }) => parent?.modelSource !== 'file',
      group: 'content'
    },
    {
      name: 'modelUrl',
      title: 'Model URL',
      type: 'url',
      description:
        'Direct link to a GLB. The host must allow cross-origin (CORS) requests.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
      hidden: ({ parent }) => parent?.modelSource !== 'url',
      group: 'content'
    },
    {
      name: 'modelCloudinary',
      title: 'Cloudinary model',
      type: 'cloudinary.asset',
      description: 'Must be a GLB file',
      hidden: ({ parent }) => parent?.modelSource !== 'cloudinary',
      group: 'content'
    },
    {
      name: 'lights',
      title: 'Ambient light',
      type: 'color',
      description:
        'Optional ambient fill light (helps if the model looks dark).',
      group: 'content'
    },
    {
      name: 'caption',
      type: 'text',
      rows: 2,
      group: 'content'
    },
    {
      name: 'source',
      type: 'url',
      description: 'Credit link shown in the caption',
      group: 'content'
    },
    {
      name: 'background',
      type: 'color',
      description: 'Background color',
      group: 'options'
    },
    {
      name: 'aspectRatio',
      title: 'Aspect ratio',
      type: 'string',
      options: {
        list: [
          { title: 'Wide (16:9)', value: '16:9' },
          { title: 'Standard (4:3)', value: '4:3' },
          { title: 'Square (1:1)', value: '1:1' },
          { title: 'Cinema (21:9)', value: '21:9' }
        ],
        layout: 'radio'
      },
      initialValue: '16:9',
      group: 'options'
    },
    ...blockLayoutFields({ group: 'options' }),
    {
      name: 'environmentSource',
      title: 'Environment (reflections)',
      type: 'string',
      description:
        'Image-based lighting for reflective (metal/glass) materials. Leave unset for no environment.',
      options: {
        list: [
          { title: 'Preset', value: 'preset' },
          { title: 'Theme image', value: 'theme' },
          { title: 'File upload', value: 'file' },
          { title: 'URL', value: 'url' },
          { title: 'Cloudinary', value: 'cloudinary' }
        ],
        // dropdown (not radio) so the editor can clear it back to no environment —
        // Sanity radios can't be deselected once set.
        layout: 'dropdown'
      },
      group: 'options'
    },
    {
      name: 'environmentPreset',
      title: 'Environment preset',
      type: 'string',
      options: {
        list: [
          'apartment',
          'bridge',
          'city',
          'dawn',
          'esplanade',
          'forest',
          'hall',
          'lab',
          'lobby',
          'night',
          'park',
          'sky',
          'studio',
          'sunrise',
          'sunset',
          'venice',
          'warehouse',
          'workshop'
        ]
      },
      initialValue: 'studio',
      hidden: ({ parent }) => parent?.environmentSource !== 'preset',
      group: 'options'
    },
    {
      name: 'environmentFile',
      title: 'Environment file',
      type: 'file',
      description: 'HDRI for reflections (.hdr or .exr)',
      options: { accept: '.hdr,.exr' },
      hidden: ({ parent }) => parent?.environmentSource !== 'file',
      group: 'options'
    },
    {
      name: 'environmentUrl',
      title: 'Environment URL',
      type: 'url',
      description:
        'Direct link to a .hdr or .exr HDRI. The host must allow CORS and the URL must end in .hdr/.exr.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
      hidden: ({ parent }) => parent?.environmentSource !== 'url',
      group: 'options'
    },
    {
      name: 'environmentCloudinary',
      title: 'Cloudinary environment',
      type: 'cloudinary.asset',
      description: 'HDRI for reflections (.hdr or .exr)',
      hidden: ({ parent }) => parent?.environmentSource !== 'cloudinary',
      group: 'options'
    },
    {
      name: 'environmentBackground',
      title: 'Show environment as background',
      type: 'boolean',
      description:
        'Render the HDRI as the visible backdrop (overrides the background colour).',
      initialValue: false,
      hidden: ({ parent }) => !parent?.environmentSource,
      group: 'options'
    },
    {
      name: 'keyLight',
      title: 'Add key light',
      type: 'boolean',
      description: 'Adds a directional light for highlights and a shaded side.',
      initialValue: false,
      group: 'options'
    },
    {
      name: 'bloom',
      title: 'Glow',
      type: 'string',
      description: 'Highlights bleed a soft glow.',
      options: {
        list: [
          { title: 'Off', value: 'off' },
          { title: 'Quiet', value: 'quiet' },
          { title: 'Medium', value: 'medium' }
        ],
        layout: 'radio'
      },
      initialValue: 'off',
      group: 'options'
    },
    {
      name: 'grain',
      title: 'Film grain',
      type: 'boolean',
      description: 'Fine monochrome grain. It rides on the glow.',
      initialValue: false,
      hidden: ({ parent }) => !GLOWING.includes(parent?.bloom),
      group: 'options'
    },
    {
      name: 'vignette',
      title: 'Vignette',
      type: 'boolean',
      description: 'Darkens the frame towards its edges. It rides on the glow.',
      initialValue: false,
      hidden: ({ parent }) => !GLOWING.includes(parent?.bloom),
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
      source: 'modelSource',
      file: 'modelFile.asset.originalFilename',
      url: 'modelUrl',
      cloudinary: 'modelCloudinary.public_id'
    },
    prepare({ source, file, url, cloudinary }) {
      const subtitle =
        source === 'file' ? file : source === 'url' ? url : cloudinary;
      return { title: '3D scene', subtitle: subtitle || 'No model' };
    }
  }
};

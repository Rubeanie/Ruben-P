import { IoMdCube } from 'react-icons/io';

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
      description: 'Optional ambient fill light (helps if the model looks dark).',
      group: 'content'
    },
    {
      name: 'background',
      type: 'color',
      description: 'Background color',
      group: 'options'
    },
    {
      name: 'height',
      type: 'string',
      description: 'Canvas height override, e.g. 70vh or 500px (default 70vh)',
      group: 'options'
    },
    {
      name: 'width',
      type: 'string',
      description: 'Canvas width override, e.g. 100% or 800px (default 100%)',
      group: 'options'
    },
    {
      name: 'environmentSource',
      title: 'Environment (reflections)',
      type: 'string',
      description:
        'Image-based lighting for reflective (metal/glass) materials. Leave unset for no environment.',
      options: {
        list: [
          { title: 'Preset', value: 'preset' },
          { title: 'File upload', value: 'file' },
          { title: 'URL', value: 'url' },
          { title: 'Cloudinary', value: 'cloudinary' }
        ],
        layout: 'radio'
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
      description: 'Render the HDRI as the visible backdrop (overrides the background colour).',
      initialValue: false,
      hidden: ({ parent }) => !parent?.environmentSource,
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

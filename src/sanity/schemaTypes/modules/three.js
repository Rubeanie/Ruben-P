import { IoMdCube } from 'react-icons/io';
import { blockLayoutFields } from '../fragments/fields/block-layout';
import { uidField } from '../fragments/fields/uid';
import ModelInput from './three/ModelInput';
import PosterInput from './three/PosterInput';

const LEVEL_OPTIONS = {
  list: [
    { title: 'Off', value: 'off' },
    { title: 'Light', value: 'light' },
    { title: 'Strong', value: 'strong' }
  ],
  layout: 'radio'
};

// Cloudinary's free plan caps raw files here anyway, and even near it a
// phone connection is slow.
const MAX_MODEL_BYTES = 10 * 1024 * 1024;
const MAX_MB = MAX_MODEL_BYTES / 1024 / 1024;

const notTooBig = (Rule) =>
  Rule.custom((asset) =>
    !asset?.bytes || asset.bytes <= MAX_MODEL_BYTES
      ? true
      : `This file is ${(asset.bytes / 1024 / 1024).toFixed(1)} MB. Large files are slow to load on a phone connection.`
  ).warning();

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
          { title: 'Cloudinary', value: 'cloudinary' },
          { title: 'URL', value: 'url' }
        ],
        layout: 'radio'
      },
      initialValue: 'cloudinary',
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
      description: `A GLB, ${MAX_MB} MB at most on the free plan. Select... opens the Cloudinary Media Library; upload there.`,
      components: { input: ModelInput },
      hidden: ({ parent }) => parent?.modelSource === 'url',
      validation: notTooBig,
      group: 'content'
    },
    {
      name: 'poster',
      type: 'cloudinaryImage',
      description:
        'Shown softly blurred until the visitor loads the model. Generate it from the scene, or pick your own image.',
      components: { input: PosterInput },
      hidden: ({ parent }) => !parent?.loadOnClick,
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
          { title: 'Page photo (reflections)', value: 'theme' },
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
      description: `HDRI for reflections (.hdr or .exr), ${MAX_MB} MB at most on the free plan. Select... opens the Cloudinary Media Library; upload there.`,
      components: { input: ModelInput },
      hidden: ({ parent }) => parent?.environmentSource !== 'cloudinary',
      validation: notTooBig,
      group: 'options'
    },
    {
      name: 'environmentBackground',
      title: 'Show environment as background',
      type: 'boolean',
      description:
        'Render the HDRI as the visible backdrop (overrides the background colour).',
      initialValue: false,
      // The page photo reflects only: a backdrop of it would hide the page.
      hidden: ({ parent }) =>
        !parent?.environmentSource || parent.environmentSource === 'theme',
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
      type: 'string',
      description:
        'Fine grain that moves like film. It holds still when motion is reduced.',
      options: LEVEL_OPTIONS,
      initialValue: 'off',
      group: 'options'
    },
    {
      name: 'vignette',
      title: 'Vignette',
      type: 'string',
      description: 'Darkens the frame towards its edges.',
      options: LEVEL_OPTIONS,
      initialValue: 'off',
      group: 'options'
    },
    {
      name: 'loadOnClick',
      title: 'Load on click',
      type: 'boolean',
      description:
        'Shows a poster and loads the model only when the visitor asks. For heavy models.',
      initialValue: false,
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
    },
    uidField({ group: 'options' })
  ],
  preview: {
    select: {
      source: 'modelSource',
      url: 'modelUrl',
      cloudinary: 'modelCloudinary.public_id'
    },
    prepare({ source, url, cloudinary }) {
      const subtitle = source === 'url' ? url : cloudinary;
      return { title: '3D scene', subtitle: subtitle || 'No model' };
    }
  }
};

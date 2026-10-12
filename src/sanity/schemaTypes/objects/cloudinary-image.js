import { clipField } from '../fragments/fields/clip';
import { CloudinaryImageInput } from '../../components/CloudinaryImageInput';

const swatch = (name) => ({
  name,
  type: 'object',
  fields: [{ name: 'background', type: 'string' }]
});

// New documents fill in the image's defaults below, so an untouched image is
// still an object: required means it has an asset, checked by the field that
// needs one.
export const imageRequired = (Rule) =>
  Rule.custom((image) => (image?.asset ? true : 'Required'));

// A Cloudinary image or video. The input fills palette, focus and lqip from
// the asset, noting in derivedFrom what they were made for; the editor never
// touches them.
export const cloudinaryImage = {
  name: 'cloudinaryImage',
  title: 'Image',
  type: 'object',
  components: { input: CloudinaryImageInput },
  fields: [
    {
      name: 'asset',
      type: 'cloudinary.asset'
    },
    clipField,
    // Readers treat anything but an explicit false as on, so images saved
    // before the switch existed keep the blur.
    {
      name: 'blur',
      title: 'Blur placeholder',
      type: 'boolean',
      description:
        'Fades in from a blurred preview; off shows a solid colour from the image.',
      initialValue: true
    },
    {
      name: 'palette',
      type: 'object',
      hidden: true,
      fields: [swatch('dominant'), swatch('vibrant')]
    },
    {
      name: 'focus',
      type: 'object',
      hidden: true,
      fields: [
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' }
      ]
    },
    { name: 'lqip', type: 'string', hidden: true },
    // The asset and Start the three above were worked out for.
    { name: 'derivedFrom', type: 'string', hidden: true }
  ]
};

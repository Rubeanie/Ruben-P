import { LuBox, LuGalleryHorizontal, LuImage, LuYoutube } from 'react-icons/lu';
import { getYouTubeId } from '@/lib/youtube';
import { assetPreview } from '../../components/CloudinaryPreview';
import { imageBlock } from '../fragments/image-block';
import { youTubeBlock } from '../fragments/youTubeBlock';
import { blockLayoutFields } from '../fragments/fields/block-layout';
import { uidField } from '../fragments/fields/uid';
import { threeJs } from './three';

// A field of another type, without the fieldset or group it sits in there.
const reuse = (type, name, overrides) => {
  const { fieldset, group, ...field } = type.fields.find(
    (f) => f.name === name
  );
  return { ...field, ...overrides };
};

const required = (Rule) => Rule.required();

const caption = reuse(imageBlock, 'caption', {
  description: 'Shows under the carousel while this item is in front.'
});
const source = reuse(imageBlock, 'source', {
  description: 'Credit link; the caption becomes the link.'
});

// An item's picture, from its stored value, for the list and the module's
// preview: the item's own preview selects the same paths the stored item has.
function media(item) {
  const image = item.image?.asset ?? item.poster?.asset;
  if (image) return assetPreview(image, item.alt);
  const id = item.url && getYouTubeId(item.url);
  if (id)
    return (
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=''
        style={{ objectFit: 'cover' }}
      />
    );
}

const carouselImage = {
  name: 'carouselImage',
  title: 'Image',
  type: 'object',
  icon: LuImage,
  fields: [
    reuse(imageBlock, 'image'),
    reuse(imageBlock, 'alt', { validation: required }),
    caption,
    source
  ],
  preview: {
    select: {
      caption: 'caption',
      alt: 'alt',
      image: 'image'
    },
    prepare: (item) => ({
      title: item.caption || item.alt,
      subtitle: 'Image',
      media: media(item)
    })
  }
};

const carouselYouTube = {
  name: 'carouselYouTube',
  title: 'YouTube',
  type: 'object',
  icon: LuYoutube,
  fields: [
    reuse(youTubeBlock, 'url', {
      validation: (Rule) => [
        Rule.required(),
        Rule.custom((url) =>
          !url || getYouTubeId(url) ? true : 'Not a YouTube video link.'
        )
      ]
    }),
    caption,
    source
  ],
  preview: {
    select: { caption: 'caption', url: 'url' },
    prepare: ({ caption, url }) => ({
      title: caption || url,
      subtitle: 'YouTube',
      media: media({ url })
    })
  }
};

const carouselScene = {
  name: 'carouselScene',
  title: '3D scene',
  type: 'object',
  icon: LuBox,
  fields: [
    reuse(threeJs, 'modelSource'),
    reuse(threeJs, 'modelUrl'),
    reuse(threeJs, 'modelCloudinary'),
    // The poster stands in until the visitor loads the model, so it is required.
    reuse(threeJs, 'poster', {
      hidden: false,
      validation: (Rule) =>
        Rule.required().error('A poster shows until the model loads.')
    }),
    reuse(threeJs, 'background', {
      description: 'Behind the model; the card stays opaque without one.'
    }),
    reuse(threeJs, 'lights'),
    reuse(threeJs, 'environmentSource'),
    reuse(threeJs, 'environmentPreset'),
    reuse(threeJs, 'environmentUrl'),
    reuse(threeJs, 'environmentCloudinary'),
    reuse(threeJs, 'environmentBackground'),
    reuse(threeJs, 'keyLight'),
    reuse(threeJs, 'bloom'),
    reuse(threeJs, 'grain'),
    reuse(threeJs, 'vignette'),
    reuse(threeJs, 'orbitControls'),
    reuse(threeJs, 'zoom'),
    {
      name: 'alt',
      type: 'string',
      description: 'What the model shows; read out on its load button.',
      validation: required
    },
    caption,
    source
  ],
  preview: {
    select: {
      caption: 'caption',
      alt: 'alt',
      poster: 'poster'
    },
    prepare: (item) => ({
      title: item.caption || item.alt,
      subtitle: '3D scene',
      media: media(item)
    })
  }
};

export const mediaCarousel = {
  name: 'media-carousel',
  title: 'Media carousel',
  icon: LuGalleryHorizontal,
  type: 'object',
  fields: [
    {
      name: 'items',
      type: 'array',
      of: [carouselImage, carouselYouTube, carouselScene],
      validation: (Rule) => Rule.min(2).max(12)
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
          { title: 'Portrait (3:4)', value: '3:4' }
        ],
        layout: 'radio'
      },
      initialValue: '16:9'
    },
    ...blockLayoutFields(),
    {
      name: 'loop',
      type: 'boolean',
      description: 'Wrap from the last item back to the first.',
      initialValue: false
    },
    uidField()
  ],
  preview: {
    select: {
      items: 'items',
      aspectRatio: 'aspectRatio',
      size: 'size',
      loop: 'loop'
    },
    prepare({ items = [], aspectRatio, size, loop }) {
      return {
        title: 'Media carousel',
        subtitle: `${items.length} items · ${aspectRatio || '16:9'}${size && size !== 'full' ? ` · ${size}` : ''}${loop ? ' · loop' : ''}`,
        media: items[0] && media(items[0])
      };
    }
  }
};

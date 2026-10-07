import { stegaClean } from '@sanity/client/stega';
import { coverSizes, PHONE } from '@/lib/coverSizes';
import { placeholderFor, resolveImage } from '@/lib/imageBlock';
import { portraitCrop } from '@/lib/imageLoader';

// The hero's settle starts the photo this much larger.
export const GLASS_ZOOM = 1.12;

// Exact complements, matching the stylesheet's phone breakpoint.
const PAIR_MEDIA = [`not all and ${PHONE}`, PHONE];
const PORTRAIT = 3 / 4;

// The field each hero keeps its photo in; its alt text is `${field}Alt`.
export const HERO_PHOTO_FIELDS = {
  hero: 'bgImage',
  'hero.saas': 'image',
  'hero.split': 'image'
};

// A hero module's photo field, or undefined for any other module.
export const heroPhoto = (module) =>
  module?.[HERO_PHOTO_FIELDS[stegaClean(module?._type)]];

// The renditions a hero module draws ({ image, src, sizes, media }), so the
// page and the intent preload ask the CDN for the same ones. `image` is the
// resolved field, `src` the picture this rendition shows: a clip that plays
// as video shows its still, with the video over it.
export function heroPhotos(module) {
  const field = heroPhoto(module);
  const image = resolveImage(field);
  if (!image) return [];
  const src = image.clip?.video ? image.still : image.src;
  const ratio = image.width && image.height && image.width / image.height;
  switch (stegaClean(module._type)) {
    case 'hero': {
      const photo = { image, src, sizes: coverSizes(ratio, 100) };
      // Phones get a portrait cut of a still instead of a sliver of the
      // landscape; an animation plays whole.
      if (image.moving) return [photo];
      return [
        { ...photo, media: PAIR_MEDIA[0] },
        {
          image,
          src: portraitCrop(src),
          sizes: coverSizes(ratio && Math.min(ratio, PORTRAIT), 100),
          media: PAIR_MEDIA[1],
          // The same cut of the lqip, centred as the CDN centres the photo.
          placeholder: placeholderFor({ ...image, blur: field.blur }, PORTRAIT)
        }
      ];
    }
    case 'hero.split':
      return [{ image, src, sizes: `${PHONE} 100vw, 50vw` }];
    case 'hero.saas':
      return [{ image, src, sizes: coverSizes(ratio, 100, 100, GLASS_ZOOM) }];
    default:
      return [];
  }
}

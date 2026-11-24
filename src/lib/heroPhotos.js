import { stegaClean } from '@sanity/client/stega';
import { coverSizes, PHONE, up } from '@/lib/coverSizes';
import { placeholderFor, resolveImage } from '@/lib/imageBlock';
import { fillCrop, portraitCrop } from '@/lib/imageLoader';

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
    case 'hero.split': {
      // The frame is a square of min(60svh, half the row) off phones; the
      // row's half is 46vw inside the hero's 4vw padding, so they meet on a
      // 60:46 screen. On phones it's 4:3 across the screen. `r` is the
      // picture's width / height; a wider one covers the frame by height.
      const frameSizes = (r) => {
        const wide = Math.max(1, r);
        return `${PHONE} ${up(100 * Math.max(1, (r * 3) / 4))}vw, (max-aspect-ratio: 130/100) ${up(46 * wide)}vw, ${up(60 * wide)}vh`;
      };
      // An animation plays whole, so it's sized to cover the frame.
      if (image.moving) return [{ image, src, sizes: frameSizes(ratio || 1) }];
      // The CDN cuts a still to 1:1, and to 4:3 for phones, where the frame
      // spans the screen under the copy and a square would run off it; the
      // rest of the photo never downloads.
      const cut = (w, h) => ({
        image,
        src: fillCrop(src, `${w}:${h}`),
        placeholder: placeholderFor({ ...image, blur: field.blur }, w / h)
      });
      return [
        { ...cut(1, 1), sizes: frameSizes(1), media: PAIR_MEDIA[0] },
        { ...cut(4, 3), sizes: '100vw', media: PAIR_MEDIA[1] }
      ];
    }
    case 'hero.saas':
      return [{ image, src, sizes: coverSizes(ratio, 100, 100, GLASS_ZOOM) }];
    default:
      return [];
  }
}

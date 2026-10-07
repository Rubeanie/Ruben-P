import { coverSizes, PHONE } from '@/lib/coverSizes';

// The hero's settle starts the photo this much larger.
export const GLASS_ZOOM = 1.12;

// Exact complements, matching the stylesheet's phone breakpoint.
const PAIR_MEDIA = [`not all and ${PHONE}`, PHONE];

const ratio = (image) => image?.asset?.metadata?.dimensions?.aspectRatio;

// The photos a hero module draws, with the `sizes` each renders at, so the
// page and the intent preload ask the optimizer for the same renditions.
// A desktop and mobile pair splits at the phone breakpoint by `media`.
export function heroPhotos(module) {
  switch (module?._type) {
    case 'hero': {
      const photos = [module.bgImage, module.bgImageMobile].filter(
        (image) => image?.asset?.url
      );
      const media = photos.length === 2 ? PAIR_MEDIA : [];
      return photos.map((image, i) => ({
        image,
        sizes: coverSizes(ratio(image), 100),
        media: media[i]
      }));
    }
    case 'hero.split':
      return [{ image: module.image, sizes: `${PHONE} 100vw, 50vw` }];
    case 'hero.saas':
      return [
        {
          image: module.image,
          sizes: coverSizes(ratio(module.image), 100, 100, GLASS_ZOOM)
        }
      ];
    default:
      return [];
  }
}

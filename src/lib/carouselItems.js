import { stegaClean } from '@sanity/client/stega';
import { resolveAsset } from '@/lib/imageBlock';
import { getYouTubeId } from '@/lib/youtube';

// Whether a carousel item has the media its card needs: the carousel draws
// only these, so every count of its cards counts them.
export function renderable(item) {
  switch (stegaClean(item?._type)) {
    case 'carouselImage':
      return Boolean(resolveAsset(item));
    case 'carouselYouTube':
      return Boolean(getYouTubeId(stegaClean(item.url)));
    case 'carouselScene':
      return Boolean(stegaClean(item.model));
    default:
      return false;
  }
}

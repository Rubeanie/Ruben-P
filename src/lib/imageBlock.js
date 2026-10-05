import { stegaClean } from '@sanity/client/stega';
import { PHONE } from '@/lib/coverSizes';

// Rendered widths of an image block in prose and in a Creative column.
export const PROSE_SIZES = `${PHONE} 100vw, 65rem`;
export const CREATIVE_SIZES = `${PHONE} 100vw, 30rem`;
// The click-to-load 3D scene's poster, blurred behind its play button.
export const SCENE_POSTER_SIZES = `${PHONE} 50vw, 32rem`;

export function resolveAsset({ imageType, image, cloudinaryAsset }) {
  if (stegaClean(imageType) === 'cloudinary.asset') {
    const src = cloudinaryAsset?.derived_url || cloudinaryAsset?.secure_url;
    return src
      ? {
          src: stegaClean(src),
          width: cloudinaryAsset.width,
          height: cloudinaryAsset.height
        }
      : null;
  }
  const asset = image?.asset;
  if (!asset?.url) return null;
  return {
    src: stegaClean(asset.url),
    width: asset.metadata?.dimensions?.width,
    height: asset.metadata?.dimensions?.height,
    blurDataURL: asset.metadata?.lqip
  };
}

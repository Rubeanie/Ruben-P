import { stegaClean } from '@sanity/client/stega';
import { PHONE } from '@/lib/coverSizes';
import {
  clipSettings,
  isAnimated,
  isClip,
  stillFrame
} from '@/lib/imageLoader';

// Rendered widths of an image block in prose and in a Creative column.
export const PROSE_SIZES = `${PHONE} 100vw, 65rem`;
export const CREATIVE_SIZES = `${PHONE} 100vw, 30rem`;
// The click-to-load 3D scene's poster, blurred behind its play button.
export const SCENE_POSTER_SIZES = `${PHONE} 50vw, 32rem`;

// How much of the measure a block's size option takes above a phone, as
// figure-block styles it; phones always get the full column.
const SIZE_FRACTION = { medium: 0.75, small: 0.5 };
export const sizeFraction = (size) => SIZE_FRACTION[size] ?? 1;

// `sizes` ending in the block's widest width, scaled to its size option.
export function sizedSizes(sizes, size) {
  const fraction = sizeFraction(size);
  if (fraction === 1) return sizes;
  return sizes.replace(
    /([\d.]+)(rem|vw)$/,
    (_, width, unit) => `${Math.ceil(width * fraction * 10) / 10}${unit}`
  );
}

// A video has no srcset, so a clip takes one width: 1.5x the widest rem width
// in `sizes` (24px a rem), between sharp and light; media conditions are not
// widths, so they're dropped first.
export function clipWidth(sizes) {
  const widths = sizes.replace(/\([^()]*:[^()]*\)/g, '');
  const rems = [...widths.matchAll(/([\d.]+)rem/g)].map(([, rem]) => +rem);
  const wide = Math.ceil((Math.max(0, ...rems) * 24) / 100) * 100;
  return Math.min(wide || 1920, 1920);
}

// `clip` comes with a Cloudinary video: its cut settings, plus whether it plays
// as a video (the default) or as an animated image.
const clipFor = (src, clip) =>
  isClip(src) ? { ...clipSettings(clip), video: !clip?.animatedImage } : null;

export function resolveAsset({ imageType, image, cloudinaryAsset, clip }) {
  if (stegaClean(imageType) === 'cloudinary.asset') {
    const src = stegaClean(
      cloudinaryAsset?.derived_url || cloudinaryAsset?.secure_url
    );
    if (!src) return null;
    const settled = clipFor(src, clip);
    return {
      src,
      width: cloudinaryAsset.width,
      height: cloudinaryAsset.height,
      ...(settled && { clip: settled })
    };
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

// A Cloudinary image field (a post cover; every image field later) as readers
// draw it. `still` is what shows at rest: the image itself, or the first frame
// of a clip's cut or of a GIF; `moving` says there is an animation behind it.
export function resolveImage(value) {
  const { asset, clip, palette, focus, lqip } = stegaClean(value) ?? {};
  const src = asset?.derived_url || asset?.secure_url;
  if (!src) return null;
  const settled = clipFor(src, clip);
  const moving = isAnimated(src);
  return {
    src,
    still: moving ? stillFrame(src, settled) : src,
    width: asset.width,
    height: asset.height,
    clip: settled,
    moving,
    palette,
    focus,
    lqip
  };
}

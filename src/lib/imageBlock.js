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

// A point of the image, 0-1 each way, as a CSS position.
const percent = (n) => `${Math.round(n * 1000) / 10}%`;
const positionOf = (focus) =>
  focus ? `${percent(focus.x)} ${percent(focus.y)}` : undefined;

const svgUrl = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const HEX = /^#[\da-f]{3,8}$/i;

// What shows under an image until it paints: its lqip blurred or, with the
// field's blur switched off, its dominant colour. The blur is an SVG in the
// image's own shape, so next/image's cover-fit and object-position frame it
// like the photo; the lqip overhangs the box so the blur keeps its edges.
// `crop` (width / height) narrows it to the cut the CDN's g_auto makes around
// the subject, for a rendition that is that cut.
export function placeholderFor(
  { blur, lqip, palette, width, height, focus },
  crop
) {
  if (blur !== false && lqip?.startsWith('data:image/')) {
    const h = Math.round((100 * height) / width) || 56;
    const w = Math.min(100, crop ? Math.round(h * crop) : 100);
    const x = Math.min(Math.max(0, (focus?.x ?? 0.5) * 100 - w / 2), 100 - w);
    return svgUrl(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${Math.round(x)} 0 ${w} ${h}'><filter id='b'><feGaussianBlur stdDeviation='4'/></filter><image x='-10' y='${-h / 10}' width='120' height='${h * 1.2}' preserveAspectRatio='none' filter='url(#b)' href='${lqip}'/></svg>`
    );
  }
  const colour = palette?.dominant?.background;
  return HEX.test(colour ?? '')
    ? svgUrl(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='${colour}'/></svg>`
      )
    : 'empty';
}

// What an image field shows at rest, for heads, feeds, crawlers and crops.
export const stillOf = (value) => resolveImage(value)?.still;

// A Cloudinary image field as readers draw it. `still` is what shows at rest:
// the image itself, or the first frame of a clip's cut or of a GIF; `moving`
// says there is an animation behind it. `position` frames a cover-fit box
// around the subject; `placeholder` goes to next/image or a CSS background.
export function resolveImage(value) {
  const { asset, clip, blur, palette, focus, lqip } = stegaClean(value) ?? {};
  const src = asset?.derived_url || asset?.secure_url;
  // The server fetches some of these, so only Cloudinary's CDN gets through.
  if (!src?.startsWith('https://res.cloudinary.com/')) return null;
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
    lqip,
    position: positionOf(focus),
    placeholder: placeholderFor({
      blur,
      lqip,
      palette,
      width: asset.width,
      height: asset.height
    })
  };
}

// A 3D scene's poster: always its still, since it sits blurred behind the
// load button, over the field's placeholder like any image.
export function scenePoster(value) {
  const image = resolveImage(value);
  return (
    image && {
      src: image.still,
      placeholder: image.placeholder,
      position: image.position
    }
  );
}

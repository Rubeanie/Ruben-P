export const CLOUDINARY_CHAIN = /\/image\/upload\/((?:[^/]+\/)*?)(v\d+\/)/;
const VIDEO_CHAIN = /\/video\/upload\/((?:[^/]+\/)*?)(v\d+\/)/;
// stillFrame asks a video for a .jpg, which serves its first frame.
const FRAME = /\.jpg(\?|$)/;

const onVideoUpload = (src) =>
  typeof src === 'string' &&
  src.startsWith('https://res.cloudinary.com/') &&
  VIDEO_CHAIN.test(src);
export const isClip = (src) => onVideoUpload(src) && !FRAME.test(src);

// Appended last, before the version, like the image chain.
export const videoTransform = (src, transform) =>
  src.replace(VIDEO_CHAIN, `/video/upload/$1${transform}/$2`);

function sanityLoader({ src, width, quality }) {
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality || 75));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'max');
  return url.toString();
}

// Last transform before the version so earlier named or chained ones stay;
// c_limit keeps a small original from being scaled up.
const sized = (width) => `c_limit,f_auto,q_auto,w_${width}`;
const cloudinaryLoader = ({ src, width }) =>
  src.replace(CLOUDINARY_CHAIN, `/image/upload/$1${sized(width)}/$2`);

// A Cloudinary video in an image field plays as a looping animated WebP.
// No f_auto: on a video URL it serves a video again. fps_15 roughly halves
// the file and still reads as smooth motion.
export const animatedClip = (src, size) =>
  videoTransform(src, `${size}/fps_15/e_loop/fl_animated,fl_awebp,f_webp`);

const clipLoader = ({ src, width }) => animatedClip(src, `c_limit,w_${width}`);
const frameLoader = ({ src, width }) => videoTransform(src, sized(width));

// Sanity and Cloudinary resize and re-encode on their own CDNs, so those images skip
// Vercel's optimizer (and its per-transformation billing). Anything else, an
// unversioned Cloudinary URL included, gets undefined and the default optimizer.
export function loaderFor(src) {
  if (typeof src !== 'string') return undefined;
  if (src.startsWith('https://cdn.sanity.io/')) return sanityLoader;
  if (onVideoUpload(src)) return isClip(src) ? clipLoader : frameLoader;
  if (
    src.startsWith('https://res.cloudinary.com/') &&
    CLOUDINARY_CHAIN.test(src)
  )
    return cloudinaryLoader;
}

export const isAnimated = (src) =>
  /\.gif(\?|$)/i.test(src ?? '') || isClip(src);

// An animated image's first frame, a few KB in place of the whole animation:
// Sanity takes frame=1, Cloudinary pg_1, and a clip its video's first frame.
export function stillFrame(src) {
  if (isClip(src)) {
    return videoTransform(src, 'so_0').replace(/\.\w+(\?|$)/, '.jpg$1');
  }
  if (src.startsWith('https://res.cloudinary.com/')) {
    return src.replace('/image/upload/', '/image/upload/pg_1/');
  }
  return `${src}${src.includes('?') ? '&' : '?'}frame=1`;
}

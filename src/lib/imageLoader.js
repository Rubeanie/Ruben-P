export const CLOUDINARY_CHAIN = /\/image\/upload\/((?:[^/]+\/)*?)(v\d+\/)/;
const VIDEO_CHAIN = /\/video\/upload\/((?:[^/]+\/)*?)(v\d+\/)/;
// stillFrame asks a video for a .webp, which serves its first frame.
const FRAME = /\.webp(\?|$)/;
export const EXTENSION = /\.\w+(\?|$)/;

const onVideoUpload = (src) =>
  typeof src === 'string' &&
  src.startsWith('https://res.cloudinary.com/') &&
  VIDEO_CHAIN.test(src);
export const isClip = (src) => onVideoUpload(src) && !FRAME.test(src);

// Appended last, before the version, like the image chain.
export const videoTransform = (src, transform) =>
  src.replace(VIDEO_CHAIN, `/video/upload/$1${transform}/$2`);

// A transform on whichever chain the URL is on: a video's (a clip, or its .webp
// still) or an image's.
export const cloudinaryTransform = (src, transform) =>
  onVideoUpload(src)
    ? videoTransform(src, transform)
    : src.replace(CLOUDINARY_CHAIN, `/image/upload/$1${transform}/$2`);

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

// An image wider than 3:4 cut to 3:4 around its subject (g_auto, which a Media
// Library focal point steers); a taller one stays whole. Sizing goes after it.
export const portraitCrop = (src) =>
  cloudinaryTransform(src, 'if_ar_gt_0.75/c_fill,ar_3:4,g_auto/if_end');
const cloudinaryLoader = ({ src, width }) =>
  src.replace(CLOUDINARY_CHAIN, `/image/upload/$1${sized(width)}/$2`);

// A clip's cut as its image field sets it. Unset, it runs from the start for
// up to MAX_CLIP seconds at 15 fps (about half a typical video's frames, and
// still smooth) and loops; the cap holds whatever the field says. fps 0 keeps
// the video's own frame rate.
export const MAX_CLIP = 60;
// A theme's background runs behind the whole page, so it stays short.
export const THEME_CLIP = 6;
export const CLIP_FPS = [10, 15, 24];
// Takes its own output too: resolveImage settles a clip before the loaders do.
export function clipSettings(clip, max = MAX_CLIP) {
  const length = Number(clip?.length);
  return {
    start: Math.max(0, Number(clip?.start) || 0),
    length: length > 0 ? Math.min(length, max) : max,
    fps: clip?.fps === 0 || CLIP_FPS.includes(clip?.fps) ? clip.fps : 15,
    loop: clip?.playOnce !== true && clip?.loop !== false
  };
}

// The trim goes first, so the sizing and frame rate after it work on the cut.
const trim = ({ start, length }) =>
  `${start ? `so_${start},` : ''}du_${length}`;
const rate = ({ fps }) => (fps ? `fps_${fps}/` : '');

// A Cloudinary video in an image field can play as an animated WebP. No
// f_auto: on a video URL it serves a video again. Without e_loop the WebP
// plays once, as Cloudinary makes animations from videos.
export function animatedClip(src, size, clip) {
  const cut = clipSettings(clip);
  const loop = cut.loop ? 'e_loop/' : '';
  return videoTransform(
    src,
    `${trim(cut)}/${size}/${rate(cut)}${loop}fl_animated,fl_awebp,f_webp`
  );
}

// A GIF on Cloudinary plays as an animated WebP or AVIF of `width`, a sample
// came out a hundredth of the GIF's weight.
export const animatedGif = (src, width) =>
  src.replace(
    CLOUDINARY_CHAIN,
    `/image/upload/$1c_limit,w_${width},fl_animated,f_auto,q_auto/$2`
  );

// The same cut as a silent video. VP9 WebM came out about half the size of
// H.264 MP4 on a sample; the MP4 is for browsers without WebM (iOS before 17.4).
const CODECS = { webm: 'f_webm,vc_vp9', mp4: 'f_mp4,vc_h264' };

export function clipVideo(src, width, clip, format = 'mp4') {
  const cut = clipSettings(clip);
  return videoTransform(
    src,
    `${trim(cut)}/c_limit,w_${width}/${rate(cut)}ac_none,${CODECS[format]},q_auto`
  ).replace(EXTENSION, `.${format}$1`);
}

const clipLoader =
  (clip) =>
  ({ src, width }) =>
    animatedClip(src, `c_limit,w_${width}`, clip);
// The later f_auto wins over a still's own f_webp, so browsers still get AVIF.
const frameLoader = ({ src, width }) => videoTransform(src, sized(width));

// Sanity and Cloudinary resize and re-encode on their own CDNs, so those images skip
// Vercel's optimizer (and its per-transformation billing). Anything else, an
// unversioned Cloudinary URL included, gets undefined and the default optimizer.
// `clip`'s cut (start, length, fps) goes into the animated image's URL.
export function loaderFor(src, clip) {
  if (typeof src !== 'string') return undefined;
  if (src.startsWith('https://cdn.sanity.io/')) return sanityLoader;
  if (onVideoUpload(src)) return isClip(src) ? clipLoader(clip) : frameLoader;
  if (
    src.startsWith('https://res.cloudinary.com/') &&
    CLOUDINARY_CHAIN.test(src)
  )
    return cloudinaryLoader;
}

// A still (stillFrame's output) is a .gif URL too, but doesn't move.
const STILL = /[?&]frame=1(&|$)|\/pg_1\//;
export const isAnimated = (src) =>
  (/\.gif(\?|$)/i.test(src ?? '') && !STILL.test(src)) || isClip(src);

// An animated image's first frame, a few KB in place of the whole animation:
// Sanity takes frame=1, Cloudinary pg_1, and a clip the first frame of its cut.
export function stillFrame(src, clip) {
  if (isClip(src)) {
    const { start } = clipSettings(clip);
    return videoTransform(src, `so_${start},f_webp`).replace(
      EXTENSION,
      '.webp$1'
    );
  }
  if (src.startsWith('https://res.cloudinary.com/')) {
    return src.replace('/image/upload/', '/image/upload/pg_1/');
  }
  return `${src}${src.includes('?') ? '&' : '?'}frame=1`;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { PHONE } from '@/lib/coverSizes';
import { animatedClip, clipVideo } from '@/lib/imageLoader';

const REDUCED = '(prefers-reduced-motion: reduce)';
// Phones get a small rendition whatever the block's width.
const PHONE_WIDTH = 720;
// Safari's WebM path stalls on the seek a loop makes, so Apple's engine (every
// iOS browser) gets the MP4; the rest take the WebM, about half the size.
const formats = () =>
  typeof navigator !== 'undefined' && navigator.vendor?.startsWith('Apple')
    ? ['mp4']
    : ['webm', 'mp4'];

// A Cloudinary video picked as an image plays muted and chromeless over its
// first frame, which the caller draws as an image: the image holds the layout,
// placeholder and preload, and is all that shows under reduced motion. It
// mounts after hydration, and stays clear until it has a frame to show.
export default function ClipVideo({ src, clip, width, className }) {
  const ref = useRef(null);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const query = matchMedia(REDUCED);
    const update = () => setMotion(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // iOS Low Power Mode refuses autoplay, leaving the first frame under a play
  // icon; the animated image plays there instead, bigger but still moving.
  const [refused, setRefused] = useState(false);
  // Browsers don't reload a <video> whose sources change, so a new cut (a live
  // Studio edit) remounts it, to be asked to play again and to fade in afresh.
  const order = formats();
  const wide = clipVideo(src, width, clip, order[0]);
  const [loaded, setLoaded] = useState(null);
  useEffect(() => {
    ref.current
      ?.play()
      .catch((error) => error.name === 'NotAllowedError' && setRefused(true));
  }, [motion, wide]);

  // Reduced motion wins over the Low Power fallback.
  if (!motion) return null;
  if (refused) {
    const shown = matchMedia(PHONE).matches ? PHONE_WIDTH : width;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a Cloudinary animated WebP, already sized
      <img
        className={className}
        src={animatedClip(src, `c_limit,w_${shown}`, clip)}
        alt=''
        aria-hidden='true'
      />
    );
  }

  return (
    <video
      key={wide}
      ref={ref}
      className={className}
      style={loaded === wide ? undefined : { opacity: 0 }}
      onLoadedData={() => setLoaded(wide)}
      autoPlay
      muted
      playsInline
      loop={clip.loop}
      preload='metadata'
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden='true'>
      {order.flatMap((format) => [
        <source
          key={`${format}-phone`}
          media={PHONE}
          type={`video/${format}`}
          src={clipVideo(src, PHONE_WIDTH, clip, format)}
        />,
        <source
          key={format}
          type={`video/${format}`}
          src={clipVideo(src, width, clip, format)}
        />
      ])}
    </video>
  );
}

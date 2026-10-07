'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import { LuStar } from 'react-icons/lu';
import ClipVideo from '@/components/ClipVideo';
import { shapeSize, tileSizes } from '@/lib/bento';
import { resolveImage } from '@/lib/imageBlock';
import { animatedClip, animatedGif, loaderFor } from '@/lib/imageLoader';
import { easeOut, formatDate, reducedMotion } from '@/lib/posts';
import { isPagePath } from '@/lib/slug';
import styles from '@/styles/components/PostList.module.scss';

const ZOOM = 1.04;
// The animation's fade back to the still, as .motion sets it.
const FADE = 300;

// Covers this page has already decoded, so a tile that comes back paints its photo at once.
const decoded = new Set();

// One media query for every tile, made on first use so the server render never asks for it.
let finePointer = null;
function hasFinePointer() {
  if (typeof window === 'undefined') return false;
  finePointer ??= matchMedia('(hover: hover) and (pointer: fine)');
  return finePointer.matches;
}

// One dot per category in the tile's free corner; the filtered one moves to the right end with a FLIP.
function Dots({ categories, active }) {
  // Categories arrive in the site order; only the filtered one moves to the end.
  const ordered = [...categories].sort(
    (a, b) => (a._id === active) - (b._id === active)
  );
  const ref = useRef(null);
  const rects = useRef(new Map());
  useLayoutEffect(() => {
    const ul = ref.current;
    if (!ul) return;
    const reduce = reducedMotion();
    // Offsets are read against the dots' own list before any animation starts, because the tile itself moves in the morph.
    const origin = ul.getBoundingClientRect().left;
    const now = new Map(
      [...ul.children].map((el) => [
        el.dataset.id,
        el.getBoundingClientRect().left - origin
      ])
    );
    for (const el of ul.children) {
      const prev = rects.current.get(el.dataset.id);
      const dx = prev == null ? 0 : prev - now.get(el.dataset.id);
      if (dx && !reduce) {
        // The travelling dot rides above the stack, then drops back to its order.
        el.style.zIndex = 1;
        el.animate(
          [
            { transform: `translateX(${dx}px)` },
            { transform: 'translateX(0)' }
          ],
          { duration: 320, easing: easeOut(ul) }
        ).finished.finally(() => el.style.removeProperty('z-index'));
      }
    }
    rects.current = now;
  }, [active]);
  return (
    <ul ref={ref} className={styles.dots} aria-label='Categories'>
      {ordered.map((c) => {
        const color = stegaClean(c.color?.hex);
        return (
          <li
            key={c._id}
            data-id={c._id}
            title={stegaClean(c.title)}
            style={color ? { '--chip': color } : undefined}>
            {c.title}
          </li>
        );
      })}
    </ul>
  );
}

// The cover's animation over its still: a clip as video (Low Power Mode and
// reduced motion handled by ClipVideo), a clip set to play as an animated image,
// or a GIF as Cloudinary's animated WebP. Each stays clear until it can show.
function Moving({ cover, width }) {
  const [ready, setReady] = useState(false);
  const { src, clip } = cover;
  if (clip?.video)
    return (
      <ClipVideo
        className={styles.moving}
        src={src}
        clip={clip}
        width={width}
      />
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a Cloudinary animation, already sized
    <img
      className={styles.moving}
      src={
        clip
          ? animatedClip(src, `c_limit,w_${width}`, clip)
          : animatedGif(src, width)
      }
      alt=''
      aria-hidden='true'
      style={ready ? undefined : { opacity: 0 }}
      onLoad={() => setReady(true)}
    />
  );
}

// The clip is cropped to the tile like the still, so it needs the video's
// width at which its cropped side is still sharp on this screen.
function clipWidthFor(box, cover) {
  const aspect =
    cover?.width && cover?.height ? cover.width / cover.height : 16 / 9;
  const need =
    Math.max(box.offsetWidth, box.offsetHeight * aspect) * devicePixelRatio;
  return Math.min(1920, Math.ceil(need / 100) * 100);
}

export default function Tile({
  post,
  shape = '1x1',
  band = 'bottom',
  mobileShape,
  active,
  wide = false,
  morphing = false
}) {
  const [span] = shapeSize(shape);
  const wanted = tileSizes({ shape, mobileShape, wide });
  // The browser re-picks a candidate whenever this string changes, so it follows the shape only once the morph has ended.
  const [sizes, setSizes] = useState(wanted);
  if (!morphing && sizes !== wanted) setSizes(wanted);
  const img = useRef(null);
  const picture = useRef(null);
  const motion = useRef({
    x: 0,
    y: 0,
    z: 1,
    tx: 0,
    ty: 0,
    raf: 0,
    last: 0,
    hovering: false
  });
  // Exponential smoothing with a 90ms constant: the picture eases toward the pointer and settles on its own.
  const settle = (now) => {
    const m = motion.current;
    // On the picture, so the still and the animation over it move as one.
    const el = picture.current;
    if (!el) return;
    const dt = Math.min(48, now - (m.last || now));
    m.last = now;
    const k = 1 - Math.exp(-dt / 90);
    m.x += (m.tx - m.x) * k;
    m.y += (m.ty - m.y) * k;
    m.z += ((m.hovering ? ZOOM : 1) - m.z) * k;
    el.style.setProperty('--mx', m.x.toFixed(4));
    el.style.setProperty('--my', m.y.toFixed(4));
    el.style.setProperty('--zoom', m.z.toFixed(4));
    const settled =
      Math.hypot(m.tx - m.x, m.ty - m.y) < 0.002 &&
      Math.abs((m.hovering ? ZOOM : 1) - m.z) < 0.001;
    if (!settled) {
      m.raf = requestAnimationFrame(settle);
      return;
    }
    // A still pointer needs no frames; the next move restarts the loop.
    m.raf = 0;
    if (m.hovering) return;
    m.x = m.y = 0;
    m.z = 1;
    el.removeAttribute('data-depth');
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    el.style.removeProperty('--zoom');
  };
  useEffect(() => () => cancelAnimationFrame(motion.current.raf), []);

  const cover = resolveImage(post.cover);
  // A tile filtered out and back mounts fresh, and the morph snapshots it before any effect runs,
  // so a cover decoded earlier starts loaded instead of freezing its plate into the snapshot.
  const [loaded, setLoaded] = useState(() => decoded.has(cover?.still));
  // A cached image can finish before hydration, so onLoad alone leaves it at zero.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setLoaded(true);
  }, []);
  // The placeholder goes once the still has faded in over it, so none shows
  // through a transparent cover or round its edge as the follow tilts it.
  const [faded, setFaded] = useState(() => decoded.has(cover?.still));
  const plate = cover?.palette?.dominant?.background;
  const placeholder =
    cover && !faded && cover.placeholder !== 'empty'
      ? `url("${cover.placeholder}")`
      : undefined;

  // A moving cover plays while a mouse or pen rests on the tile or the keyboard
  // focuses it, never on touch or under reduced motion. The layer stays mounted
  // (`shown`) through the fade back, then goes. A new play remounts it, so a
  // hover during the fade starts the cut afresh.
  const intent = useRef({ hover: false, focus: false });
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(false);
  const [plays, setPlays] = useState(0);
  // The clip's width, fixed at the start of a play.
  const [clipPx, setClipPx] = useState(0);
  const request = (key, on) => {
    intent.current[key] = on;
    const next =
      Boolean(cover?.moving) &&
      !reducedMotion() &&
      (intent.current.hover || intent.current.focus);
    if (next && !playing) {
      setPlays((n) => n + 1);
      setClipPx(clipWidthFor(picture.current, cover));
    }
    setPlaying(next);
    if (next) setShown(true);
  };
  // A live edit can swap the cover out from under a playing layer.
  const [playedSrc, setPlayedSrc] = useState(cover?.src);
  if (playedSrc !== cover?.src) {
    setPlayedSrc(cover?.src);
    setPlaying(false);
    setShown(false);
  }
  useEffect(() => {
    if (playing || !shown) return;
    const timer = setTimeout(() => setShown(false), FADE);
    return () => clearTimeout(timer);
  }, [playing, shown]);
  const featured = Boolean(stegaClean(post.featured));
  const publishDate = post.publishDate ? stegaClean(post.publishDate) : null;
  const date = publishDate ? formatDate(publishDate) : '';
  const showDate = Boolean(date) && (span === 2 || mobileShape === '2x1');
  const categories = post.categories ?? [];
  // A malformed or template slug has no safe path; the tile still renders, just without a link.
  const slug = stegaClean(post.slug);
  const hasPath = isPagePath(slug);
  const Wrapper = hasPath ? Link : 'div';
  return (
    <Wrapper
      {...(hasPath && { href: slug })}
      className={styles.tile}
      data-post-id={post._id}
      data-shape={shape}
      data-band={band}
      data-mobile-shape={mobileShape}
      data-wide={wide || undefined}
      data-loaded={!cover || loaded || undefined}
      style={{
        '--plate': plate,
        // Bento tiles are named so a filter change morphs each one; the related row never transitions.
        viewTransitionName: wide
          ? undefined
          : `tile-${post._id.replace(/[^\w-]/g, '-')}`
      }}
      onPointerEnter={(e) =>
        e.pointerType !== 'touch' && request('hover', true)
      }
      // A tap focuses a link in some browsers; only keyboard focus shows a ring, and plays.
      onFocus={(e) =>
        e.currentTarget.matches(':focus-visible') && request('focus', true)
      }
      onBlur={() => request('focus', false)}
      onPointerMove={(e) => {
        if (!hasFinePointer()) return;
        if (reducedMotion()) return;
        if (!img.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        const m = motion.current;
        m.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        m.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        m.hovering = true;
        picture.current.setAttribute('data-depth', '');
        if (!m.raf) {
          m.last = 0;
          m.raf = requestAnimationFrame(settle);
        }
      }}
      onPointerLeave={() => {
        request('hover', false);
        const m = motion.current;
        m.hovering = false;
        m.tx = m.ty = 0;
        if (!m.raf && img.current) m.raf = requestAnimationFrame(settle);
      }}>
      {/* One source per post at every shape, framed in CSS around the subject,
          so a shape change re-clips the same bitmap instead of another crop. */}
      <div
        ref={picture}
        className={styles.picture}
        style={{ '--focus': cover?.position, '--placeholder': placeholder }}>
        {cover && (
          <Image
            ref={img}
            className={styles.img}
            src={cover.still}
            loader={loaderFor(cover.still)}
            // The link already reads the title; a second copy on the picture would announce it twice.
            alt=''
            fill
            sizes={sizes}
            onLoad={() => {
              decoded.add(cover.still);
              setLoaded(true);
            }}
            onTransitionEnd={(event) =>
              event.propertyName === 'opacity' && loaded && setFaded(true)
            }
          />
        )}
        {shown && cover?.moving && (
          <div
            key={plays}
            className={styles.motion}
            data-leaving={!playing || undefined}>
            <Moving cover={cover} width={clipPx} />
          </div>
        )}
      </div>
      <div className={styles.text}>
        <h3 className={styles.title}>
          {featured && <span className={styles.srOnly}>Featured: </span>}
          {post.title}
        </h3>
        {shape === '2x2' && !wide && post.summary && (
          <p className={styles.summary}>{post.summary}</p>
        )}
        {showDate && !wide && (
          <p
            className={styles.meta}
            data-mobile-only={
              (span !== 2 && mobileShape === '2x1') || undefined
            }>
            <time dateTime={publishDate}>{date}</time>
          </p>
        )}
      </div>
      {/* After the copy in DOM order, so the link's name starts with the title; the corners are absolute anyway. */}
      {featured && (
        <span className={styles.star} title='Featured'>
          <LuStar strokeWidth={0} fill='currentColor' aria-hidden='true' />
        </span>
      )}
      {categories.length > 0 && (
        <Dots categories={categories} active={active} />
      )}
    </Wrapper>
  );
}

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import { LuStar } from 'react-icons/lu';
import { imageBuilder } from '@/lib/sanity/image';
import { shapeSize } from '@/lib/bento';
import { byCategory, easeOut, formatDate, reducedMotion } from '@/lib/posts';
import styles from '@/styles/components/PostList.module.scss';

const ZOOM = 1.04;

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
function Dots({ categories, rank, active }) {
  // The chip order first so every tile reads the same sequence as the filter row, then the filtered one moves to the end.
  const ordered = [...categories]
    .sort(
      (a, b) =>
        (rank?.get(a._id) ?? Infinity) - (rank?.get(b._id) ?? Infinity) ||
        byCategory(a, b)
    )
    .sort((a, b) => (a._id === active) - (b._id === active));
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

export default function Tile({
  post,
  shape = '1x1',
  band = 'bottom',
  mobileShape,
  rank,
  active,
  wide = false,
  morphing = false
}) {
  const [span] = shapeSize(shape);
  // Rendered widths: a wide tile is one of four in the row, a grid tile one or two units.
  const wanted = wide
    ? '(max-width: 43.75rem) 82vw, 15rem'
    : `(max-width: 43.75rem) ${mobileShape === '2x1' ? 100 : 50}vw, ${span === 2 ? '31rem' : '15rem'}`;
  // The browser re-picks a candidate whenever this string changes, so it follows the shape only once the morph has ended.
  const [sizes, setSizes] = useState(wanted);
  if (!morphing && sizes !== wanted) setSizes(wanted);
  const img = useRef(null);
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
    const el = img.current;
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

  // The builder reads ids and the crop rect, so the whole cover is cleaned.
  const cover = stegaClean(post.cover);
  // A tile filtered out and back mounts fresh, and the morph snapshots it before any effect runs,
  // so a cover decoded earlier starts loaded instead of freezing its plate into the snapshot.
  const [loaded, setLoaded] = useState(() => decoded.has(cover?.asset?.url));
  // A cached image can finish before hydration, so onLoad alone leaves it at zero.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setLoaded(true);
  }, []);
  const hasCover = Boolean(cover?.asset?.url);
  // One source per post at every shape: the editor's crop applies, the tile frames it in CSS,
  // so a shape change re-clips the same bitmap instead of switching to another crop.
  const loader = ({ width, quality }) =>
    imageBuilder
      .image(cover)
      .width(width)
      .fit('max')
      .auto('format')
      .quality(quality || 75)
      .url();
  // A folded phone tile re-crops the desktop crop in CSS, so the crop follows the editor's hotspot.
  const position = cover?.hotspot
    ? { objectPosition: `${cover.hotspot.x * 100}% ${cover.hotspot.y * 100}%` }
    : undefined;
  const plate = cover?.asset?.metadata?.palette?.dominant?.background;
  const featured = Boolean(stegaClean(post.featured));
  const publishDate = post.publishDate ? stegaClean(post.publishDate) : null;
  const date = publishDate ? formatDate(publishDate) : '';
  const showDate = Boolean(date) && (span === 2 || mobileShape === '2x1');
  const categories = post.categories ?? [];
  return (
    <Link
      href={`/${stegaClean(post.slug)}`}
      className={styles.tile}
      data-post-id={post._id}
      data-shape={shape}
      data-band={band}
      data-mobile-shape={mobileShape}
      data-wide={wide || undefined}
      data-loaded={!hasCover || loaded || undefined}
      style={{
        '--plate': plate,
        // Bento tiles are named so a filter change morphs each one; the related row never transitions.
        viewTransitionName: wide
          ? undefined
          : `tile-${post._id.replace(/[^\w-]/g, '-')}`
      }}
      onPointerMove={(e) => {
        if (!hasFinePointer()) return;
        if (reducedMotion()) return;
        if (!img.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        const m = motion.current;
        m.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        m.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        m.hovering = true;
        img.current.setAttribute('data-depth', '');
        if (!m.raf) {
          m.last = 0;
          m.raf = requestAnimationFrame(settle);
        }
      }}
      onPointerLeave={() => {
        const m = motion.current;
        m.hovering = false;
        m.tx = m.ty = 0;
        if (!m.raf && img.current) m.raf = requestAnimationFrame(settle);
      }}>
      {hasCover && (
        <div className={styles.picture}>
          <Image
            ref={img}
            className={styles.img}
            src={cover.asset.url}
            loader={loader}
            // The link already reads the title; a second copy on the picture would announce it twice.
            alt=''
            fill
            sizes={sizes}
            style={position}
            onLoad={() => {
              decoded.add(cover.asset.url);
              setLoaded(true);
            }}
          />
        </div>
      )}
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
        <Dots categories={categories} rank={rank} active={active} />
      )}
    </Link>
  );
}

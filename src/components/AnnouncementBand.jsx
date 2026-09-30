'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import Link from 'next/link';
import { LuX } from 'react-icons/lu';
import { dismissKey } from '@/lib/announcement';
import AnnouncementSeparator from './AnnouncementSeparator';
import styles from '@/styles/components/Announcement.module.scss';

const SPEED = 48; // px per second
const HOLD_MS = 1000; // still after mount, so the first words can be read
const STOP_MS = 400;
const RESUME_MS = 800;
const HYSTERESIS = 8; // px; stops flapping at the fit boundary

const easeOutCubic = (p) => 1 - (1 - p) ** 3;
// velocity leaves and reaches its target with zero acceleration
const easeInOut = (p) => p * p * (3 - 2 * p);

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// Dismissed here or in another tab, or past its end: the same test as the inline script.
const isHidden = (key, end) => {
  if (end && Date.now() >= end) return true;
  try {
    return !!localStorage.getItem(key);
  } catch {
    return false;
  }
};
const onStorage = (callback) => {
  addEventListener('storage', callback);
  return () => removeEventListener('storage', callback);
};

export default function AnnouncementBand({
  id,
  end,
  text,
  href,
  separator,
  always,
  logo,
  sanity
}) {
  const bandRef = useRef(null);
  const measureRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const unitRef = useRef(null);
  const rateRef = useRef(0);
  const progressRef = useRef(0); // share of one copy's width travelled
  const widthRef = useRef(0);
  const [mode, setMode] = useState('static');
  const [copies, setCopies] = useState(2);
  const [unitWidth, setUnitWidth] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [gone, setGone] = useState(false);
  // the inline script hid it before paint; after hydration it leaves the tree
  const hidden = useSyncExternalStore(
    onStorage,
    () => isHidden(dismissKey(id), end),
    () => false
  );
  const shown = !hidden && !gone;
  const marquee = shown && mode === 'marquee';

  // A flag left by another announcement would hide this one too.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const flag = root.getAttribute('data-announcement-hidden');
    if (shown && flag !== null && flag !== id)
      root.removeAttribute('data-announcement-hidden');
  }, [id, shown]);

  // Marquee when the text overflows the centred column, or always when asked.
  useLayoutEffect(() => {
    if (!shown) return;
    const band = bandRef.current;
    const measure = measureRef.current;
    const reduce = matchMedia(REDUCED_MOTION);
    // --centre-width is a calc() string; resolve it through layout in either mode
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;visibility:hidden;height:0;width:var(--centre-width)';
    const check = () => {
      band.append(probe);
      const cs = getComputedStyle(band);
      const available =
        band.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight) -
        probe.offsetWidth;
      probe.remove();
      const width = measure.getBoundingClientRect().width;
      setMode((prev) => {
        const overflows =
          prev === 'marquee'
            ? width > available - HYSTERESIS
            : width > available;
        return !reduce.matches && (always || overflows) ? 'marquee' : 'static';
      });
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(band);
    ro.observe(measure);
    let live = true;
    document.fonts.ready.then(() => live && check());
    reduce.addEventListener('change', check);
    return () => {
      live = false;
      ro.disconnect();
      reduce.removeEventListener('change', check);
    };
  }, [always, shown]);

  // Enough copies to cover the track plus one; one copy's width is the loop.
  useLayoutEffect(() => {
    if (!marquee) return;
    const viewport = viewportRef.current;
    const unit = unitRef.current;
    const fit = () => {
      const w = unit.getBoundingClientRect().width;
      if (!w) return;
      setUnitWidth(w);
      setCopies(Math.max(2, Math.ceil(viewport.clientWidth / w) + 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(viewport);
    ro.observe(unit);
    let live = true;
    document.fonts.ready.then(() => live && fit());
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [marquee]);

  // Driven from rAF: WAAPI drops a composited animation to its start at playbackRate 0.
  useLayoutEffect(() => {
    if (!marquee || !unitWidth) return;
    widthRef.current = unitWidth;
    trackRef.current.style.transform = `translate3d(${-progressRef.current * unitWidth}px, 0, 0)`;
  }, [marquee, unitWidth]);

  // Held, hovered or focused, the loop eases to a stop; it eases back after.
  useEffect(() => {
    if (!marquee) return;
    const band = bandRef.current;
    const track = trackRef.current;
    let raf = 0;
    let last = 0;
    let tweening = null;
    let held = true;
    let visible = true;
    let pausedAt = 0;
    // it may start under the pointer or with focus inside, after a resize
    let hovered = band.matches(':hover');
    let focused = band.matches(':focus-within');
    const frame = (now) => {
      // a long gap (a background tab) resumes in place
      const dt = last ? Math.min(now - last, 100) : 0;
      last = now;
      if (tweening) {
        const { from, to, t0, ms, curve } = tweening;
        const p = Math.min(1, (now - t0) / ms);
        rateRef.current = from + (to - from) * curve(p);
        if (p === 1) tweening = null;
      }
      const w = widthRef.current;
      if (w) {
        progressRef.current =
          (progressRef.current + (SPEED * rateRef.current * dt) / 1000 / w) % 1;
        track.style.transform = `translate3d(${-progressRef.current * w}px, 0, 0)`;
      }
      raf = tweening || rateRef.current ? requestAnimationFrame(frame) : 0;
    };
    const run = () => {
      if (raf || !visible || !(tweening || rateRef.current)) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const tween = () => {
      const stop = held || hovered || focused;
      const to = stop ? 0 : 1;
      const from = rateRef.current;
      // a partial change takes its share of the time
      const ms = (stop ? STOP_MS : RESUME_MS) * Math.abs(to - from);
      const curve = stop ? easeOutCubic : easeInOut;
      tweening = ms ? { from, to, t0: performance.now(), ms, curve } : null;
      if (!ms) rateRef.current = to;
      run();
    };
    // off screen the loop sleeps; a tween resumes with the time it had left
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      const now = performance.now();
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
        pausedAt = now;
        return;
      }
      if (tweening && pausedAt)
        tweening.t0 += now - Math.max(pausedAt, tweening.t0);
      pausedAt = 0;
      run();
    });
    io.observe(band);
    const hold = setTimeout(() => {
      held = false;
      tween();
    }, HOLD_MS);
    // a tap fires enter and leave together, which would jolt the loop
    const enter = (e) => {
      if (e.pointerType === 'touch') return;
      hovered = true;
      tween();
    };
    const leave = (e) => {
      if (e.pointerType === 'touch') return;
      hovered = false;
      tween();
    };
    const focusIn = () => {
      focused = true;
      tween();
    };
    const focusOut = (e) => {
      if (band.contains(e.relatedTarget)) return;
      focused = false;
      tween();
    };
    band.addEventListener('pointerenter', enter);
    band.addEventListener('pointerleave', leave);
    band.addEventListener('focusin', focusIn);
    band.addEventListener('focusout', focusOut);
    return () => {
      clearTimeout(hold);
      io.disconnect();
      cancelAnimationFrame(raf);
      rateRef.current = 0;
      progressRef.current = 0;
      band.removeEventListener('pointerenter', enter);
      band.removeEventListener('pointerleave', leave);
      band.removeEventListener('focusin', focusIn);
      band.removeEventListener('focusout', focusOut);
    };
  }, [marquee]);

  // Without scroll-driven animations the stylesheet derives the offset from this.
  useEffect(() => {
    if (!shown || CSS.supports('animation-timeline: scroll()')) return;
    const root = document.documentElement;
    const onScroll = () =>
      root.style.setProperty('--announce-scrolled', `${scrollY}px`);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      root.style.removeProperty('--announce-scrolled');
    };
  }, [shown]);

  // Stored once the fold ends, since the stored flag alone removes the band.
  useEffect(() => {
    if (!dismissing) return;
    const band = bandRef.current;
    const finish = () => {
      try {
        localStorage.setItem(dismissKey(id), '1');
      } catch {}
      setGone(true);
    };
    const onEnd = (e) => {
      if (e.target === band && e.propertyName === 'height') finish();
    };
    // reduced motion, or no fold running for any other reason: nothing to wait for
    const folding = band
      .getAnimations()
      .some((a) => a.transitionProperty === 'height');
    if (matchMedia(REDUCED_MOTION).matches || !folding) return finish();
    band.addEventListener('transitionend', onEnd);
    band.addEventListener('transitioncancel', onEnd);
    return () => {
      band.removeEventListener('transitionend', onEnd);
      band.removeEventListener('transitioncancel', onEnd);
    };
  }, [dismissing, id]);

  const dismiss = () => {
    document.querySelector('body > nav a')?.focus();
    setDismissing(true);
  };

  if (!shown) return null;

  const content =
    mode === 'marquee' ? (
      <span className={styles.track} ref={trackRef}>
        {Array.from({ length: copies }, (_, i) => (
          <span
            key={i}
            className={styles.unit}
            ref={i === 0 ? unitRef : undefined}
            aria-hidden={i > 0 || undefined}>
            <span className={styles.copy}>{text}</span>
            <span className={styles.sep} aria-hidden='true'>
              <AnnouncementSeparator name={separator} logo={logo} />
            </span>
          </span>
        ))}
      </span>
    ) : (
      <span className={styles.copy}>{text}</span>
    );
  const viewport = (
    <span className={styles.viewport} ref={viewportRef}>
      {content}
    </span>
  );

  return (
    <div
      ref={bandRef}
      role='region'
      aria-label='Announcement'
      className={styles.band}
      data-mode={mode}
      data-dismissing={dismissing || undefined}
      inert={dismissing}
      {...(sanity && { 'data-sanity': sanity })}>
      <span className={styles.measure} aria-hidden='true' inert>
        <span ref={measureRef}>{text}</span>
      </span>
      {href ? (
        <Link className={styles.body} href={href}>
          {viewport}
        </Link>
      ) : (
        <span className={styles.body}>{viewport}</span>
      )}
      <button
        type='button'
        className={styles.dismiss}
        aria-label='Dismiss announcement'
        onClick={dismiss}>
        <LuX strokeWidth={2.5} aria-hidden='true' />
      </button>
    </div>
  );
}

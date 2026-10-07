'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeContext';
import cta from '@/styles/components/CTA.module.scss';
import styles from '@/styles/components/ThemeControls.module.scss';

// The swatch spins up and blurs its two colours together, and the theme only
// changes at full blur. Every press while it spins changes the theme again and
// spins it faster; once presses stop it eases out onto a whole turn, sharp.
const FULL = 6; // turns a second at full blur
const MAX = 15;
const BOOST = 3;
const ACCEL = 14; // turns a second, per second
const IDLE_MS = 400;

const rest = () => ({ angle: 0, v: 0, target: 0, swap: false, changed: 0 });

export default function ThemeCycle({ label }) {
  const theme = useTheme();
  const latest = useRef(theme);
  const dot = useRef(null);
  const spin = useRef(rest());
  const raf = useRef(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    latest.current = theme;
  });

  useEffect(
    () => () => {
      latest.current = null;
      cancelAnimationFrame(raf.current);
    },
    []
  );

  function change(now) {
    latest.current?.nextTheme();
    spin.current.swap = false;
    spin.current.changed = now;
  }

  function stop() {
    const style = dot.current?.style;
    style?.removeProperty('rotate');
    style?.removeProperty('--soft');
    style?.removeProperty('--blend');
    raf.current = 0;
    spin.current = rest();
    setBusy(false);
  }

  function frame(now) {
    const s = spin.current;
    // a frame's timestamp can predate the press that started it
    const dt = Math.max(0, Math.min(0.05, (now - s.t) / 1000));
    s.t = now;

    if (s.land) {
      const { a0, d, v0, t0, ms } = s.land;
      const p = Math.min(1, (now - t0) / ms);
      s.angle = a0 + d * (1 - (1 - p) ** 3);
      s.v = v0 * (1 - p) ** 2;
      if (p === 1) return stop();
    } else {
      // a steady push that softens as it nears the target
      const gap = s.target - s.v;
      s.v +=
        Math.abs(gap) < 0.05
          ? gap
          : Math.min(ACCEL * dt, gap * Math.min(1, dt * 20));
      s.angle += s.v * dt;
      if (s.swap) {
        if (s.v >= FULL) change(now);
      } else if (now - s.changed > IDLE_MS && !latest.current?.isResolving) {
        // land on the next whole turn at least a third of a turn on, leaving
        // at the current speed
        const d = Math.ceil(s.angle + s.v / 3) - s.angle;
        s.land = { a0: s.angle, d, v0: s.v, t0: now, ms: (3000 * d) / s.v };
        s.target = 0;
      }
    }

    const blur = Math.min(1, s.v / FULL);
    const style = dot.current?.style;
    style?.setProperty('rotate', `${s.angle}turn`);
    style?.setProperty('--soft', `${90 * blur}deg`);
    style?.setProperty('--blend', `${40 * blur}%`);
    raf.current = requestAnimationFrame(frame);
  }

  function press() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      theme.nextTheme();
      return;
    }

    const s = spin.current;
    const now = performance.now();
    if (!raf.current && theme.isResolving) return;
    // every press spins it faster, even one that can't change the theme yet
    s.land = null;
    s.target = Math.min(MAX, Math.max(3, s.target, s.v) + BOOST);
    s.changed = now;
    // already blurred, so the swap can happen now; otherwise at full blur
    if (!s.swap && !theme.isResolving) {
      if (s.v >= FULL) change(now);
      else s.swap = true;
    }

    if (!raf.current) {
      s.t = now;
      raf.current = requestAnimationFrame(frame);
      setBusy(true);
    }
  }

  return (
    <button
      type='button'
      className={`${cta.cta} ${cta.outline} ${styles.cycle}`}
      aria-busy={busy}
      onClick={press}>
      <span ref={dot} className={styles.swatch} aria-hidden='true' />
      {label}
    </button>
  );
}

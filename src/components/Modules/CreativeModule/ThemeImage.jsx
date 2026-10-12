'use client';

import { useEffect, useId, useRef } from 'react';
import { LuImagePlus } from 'react-icons/lu';
import { rateTween, stepRate } from '@/lib/rate';
import useImageTheme from './useImageTheme';
import styles from '@/styles/components/ThemeControls.module.scss';

// The dashes march while a photo is over the zone or being read, then coast to
// a stop where they are; the rate eases as the announcement marquee's does.
const SPEED = 8; // px per second, one dash period
const PERIOD = 8;

function useMarch(ref, moving) {
  const motion = useRef({ rate: 0, offset: 0, raf: 0, last: 0, tween: null });

  useEffect(() => {
    const m = motion.current;
    return () => {
      cancelAnimationFrame(m.raf);
      m.raf = 0;
      m.last = 0;
    };
  }, []);

  useEffect(() => {
    const m = motion.current;
    const zone = ref.current;
    const rect = zone?.querySelector('rect');
    if (!rect || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    m.tween = rateTween(m.rate, moving, performance.now());
    if (!m.tween) m.rate = moving ? 1 : 0;

    const frame = (now) => {
      const dt = m.last ? Math.min(now - m.last, 100) : 0;
      m.last = now;
      if (m.tween) {
        const [rate, done] = stepRate(m.tween, now);
        m.rate = rate;
        if (done) m.tween = null;
      }
      m.offset = (m.offset - (SPEED * m.rate * dt) / 1000) % PERIOD;
      rect.style.strokeDashoffset = `${m.offset}px`;
      const still = !m.tween && !m.rate;
      zone.toggleAttribute('data-moving', !still);
      m.raf = still ? 0 : requestAnimationFrame(frame);
      if (still) m.last = 0;
    };
    if (!m.raf) m.raf = requestAnimationFrame(frame);
  }, [ref, moving]);
}

export default function ThemeImage({ label }) {
  const id = useId();
  const zone = useRef(null);
  const input = useRef(null);
  const drop = useImageTheme();
  useMarch(zone, drop.dragging || drop.busy);

  let title = label;
  if (drop.dragging) title = 'Let go to use it';
  else if (drop.busy) title = 'Extracting colours';

  return (
    <>
      <button
        ref={zone}
        type='button'
        className={styles.drop}
        data-drag={drop.dragging || undefined}
        aria-busy={drop.busy}
        aria-disabled={drop.busy}
        aria-describedby={id}
        onClick={() => !drop.busy && input.current?.click()}
        {...drop.zone}>
        <svg className={styles.dashes} aria-hidden='true'>
          <rect x='0.5' y='0.5' />
        </svg>
        <span className={styles.disc}>
          <LuImagePlus strokeWidth={1.5} aria-hidden='true' />
        </span>
        <span className={styles.copy}>
          <span className={styles.title}>{title}</span>
          <span
            id={id}
            className={styles.hint}
            data-error={drop.error ? true : undefined}
            aria-live='polite'>
            {drop.error || (
              <>
                <span className={styles.fine}>Or drop one here. </span>
                Local only.
              </>
            )}
          </span>
        </span>
      </button>
      <input
        ref={input}
        type='file'
        accept='image/*'
        hidden
        onChange={(event) => {
          drop.take(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </>
  );
}

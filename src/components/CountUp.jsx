'use client';

import { useEffect, useRef } from 'react';
import { formatStat, parseStat } from '@/lib/countUp';
import styles from '@/styles/components/CountUp.module.scss';

// Long enough to be seen after the row has settled into view.
const DURATION = 1500;

export default function CountUp({ value, label }) {
  const parsed = parseStat(value);
  const final = parsed ? formatStat(parsed.number, parsed) : value;
  const wrapper = useRef(null);
  const counter = useRef(null);

  // The digits are written straight to the node: a frame of React state per
  // frame of animation would re-render the whole row sixty times a second.
  useEffect(() => {
    const parsed = parseStat(value);
    if (!parsed) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const node = counter.current;
    node.textContent = formatStat(0, parsed);

    let frame;
    const target =
      wrapper.current.closest('[data-count-row]') ?? wrapper.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // A row taller than the viewport can never be fully in view; at
        // least half the viewport filled by the row is the best it gets.
        const tall =
          entry.boundingClientRect.height >
          (entry.rootBounds?.height ?? Infinity);
        const ready = tall
          ? entry.intersectionRect.height >= entry.rootBounds.height / 2
          : entry.intersectionRatio >= 1;
        if (!ready) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / DURATION, 1);
          node.textContent = formatStat(
            parsed.number * (1 - (1 - t) ** 3),
            parsed
          );
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      // Whole row in view and clear of the bottom edge, so the count is not missed.
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -15% 0px'
      }
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  // Nothing to count: an emoji or a symbol renders as the editor typed it.
  if (!parsed) return label ?? value;

  return (
    // The final string is laid out under the counter so the row cannot jitter.
    <span className={styles.count} ref={wrapper}>
      <span aria-hidden='true' ref={counter}>
        {final}
      </span>
      <span aria-hidden='true' className={styles.reserve}>
        {final}
      </span>
      <span className={styles.srOnly}>{label ?? final}</span>
    </span>
  );
}

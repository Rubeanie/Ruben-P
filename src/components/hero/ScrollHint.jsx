'use client';

import { useEffect, useRef } from 'react';
import styles from '@/styles/components/ScrollHint.module.scss';

// Measured 10x6 at a 1.25 stroke; Lucide's 24-box chevron does not scale to it.
const Chevron = () => (
  <svg
    viewBox='0 0 10 6'
    width='10'
    height='6'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.25'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <path d='M1 1l4 4 4-4' />
  </svg>
);

// Replays the roll once on hover or focus, if it has come to rest.
function replay(el) {
  const loops = el
    .getAnimations({ subtree: true })
    .filter((animation) => animation instanceof CSSAnimation);
  if (loops.some((animation) => animation.playState === 'running')) return;
  for (const animation of loops) {
    animation.effect.updateTiming({ iterations: 1, delay: 0 });
    animation.currentTime = 0;
    animation.play();
  }
}

// A "scroll to continue" link at a hero's bottom edge, jumping to #next.
// align 'start' sits on the copy column (the hero sets --hint-inset).
// delay: ms after load for the entrance, the hero's own intro plus 300.
export default function ScrollHint({ next, align = 'center', delay = 1100 }) {
  const ref = useRef(null);

  // Hidden past 40px, shown again back at the top (the gap stops flicker); a
  // mid-page reload starts hidden. A hidden tab's clock keeps running, so
  // whatever is mid-motion pauses while the tab is away instead of finishing unseen.
  useEffect(() => {
    const el = ref.current;
    const events = [
      'scroll',
      'visibilitychange',
      'pageshow',
      'pagehide',
      'focus'
    ];
    let held = [];
    // 'gone' fades out with the loops still moving; 'off' is fully hidden and
    // drops them, so the next showing starts them fresh.
    const set = (state) => {
      if (state === el.dataset.state) return;
      if (state !== 'shown') el.dataset.again = '';
      if (state === 'off') el.dataset.rewound = '';
      el.dataset.state = state;
    };
    const sync = (event) => {
      const away = document.hidden || event?.type === 'pagehide';
      if (away && !held.length) {
        held = el
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running');
        held.forEach((animation) => animation.pause());
      } else if (!away) {
        held.forEach((animation) => animation.play());
        held = [];
      }
      const now = el.dataset.state;
      const state =
        window.scrollY > 40 ? 'gone' : window.scrollY <= 8 ? 'shown' : now;
      // Already out of sight (or never shown): skip the fade.
      set(
        state !== 'shown' && (now === 'pending' || now === 'off')
          ? 'off'
          : state
      );
    };
    const settle = (event) => {
      if (
        event.target === el &&
        event.propertyName === 'visibility' &&
        el.dataset.state === 'gone'
      )
        set('off');
    };
    sync();
    for (const type of events)
      window.addEventListener(type, sync, { passive: true });
    el.addEventListener('transitionend', settle);
    return () => {
      for (const type of events) window.removeEventListener(type, sync);
      el.removeEventListener('transitionend', settle);
    };
  }, []);

  const go = (event) => {
    const target = document.getElementById(next);
    if (!target) return;
    event.preventDefault();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: reduced ? 'instant' : 'smooth',
      block: 'start'
    });
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  };

  return (
    <a
      ref={ref}
      href={`#${next}`}
      className={styles.hint}
      data-align={align}
      data-state='pending'
      style={{ '--hint-delay': `${delay}ms` }}
      onClick={go}
      onPointerEnter={(event) =>
        event.pointerType === 'mouse' && replay(event.currentTarget)
      }
      onFocus={(event) => replay(event.currentTarget)}>
      <span className={styles.word}>Scroll</span>
      <span className={styles.roll} aria-hidden='true'>
        <span className={styles.rollInner}>
          <Chevron />
          <Chevron />
        </span>
      </span>
    </a>
  );
}

export function ScrollTarget({ id }) {
  return <span id={id} className={styles.target} aria-hidden='true' />;
}

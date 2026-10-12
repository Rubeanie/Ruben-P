'use client';

import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { easings, useSpring, useSprings } from '@react-spring/web';
import { behind } from './loop';
import styles from '@/styles/components/MediaCarousel.module.scss';

const fade = (duration) => ({ duration, easing: easings.easeOutCubic });
// An interrupted entrance goes straight to rest, from where it is.
const SNAP = { frequency: 0.3, damping: 1 };
const STILL = '(prefers-reduced-motion: reduce)';

// A card with e of the way still to go (1 at the start, 0 at rest): `xk` is
// how much of its sideways offset it has, `scale` over its own. The cards
// behind slide out from under the front one, the deepest first.
export const pose = (e) => ({ xk: 1 - e, scale: 1 - 0.015 * e });

// Per card, by its depth at rest, out of `deepest` drawn behind. The front
// card is nearly opaque before anything moves behind it.
const card = (d, deepest) => ({
  delay: d ? 140 + (deepest - d) * 55 : 0,
  config: (key) =>
    key === 'e' ? { tension: 200, friction: 27 } : fade(d ? 240 : 280)
});

const BAR = { delay: 450, rise: 6, config: fade(300) };

// Back and Forward bring a page back as it was left, so nothing plays in. Any
// press after that may start a new navigation. Reveal clears its own flag
// before a carousel streaming in late would see it.
let traversed = false;
if (typeof window !== 'undefined') {
  addEventListener('popstate', () => (traversed = true));
  for (const type of ['pointerdown', 'keydown'])
    addEventListener(type, () => (traversed = false), true);
}

const subscribe = () => () => {};

// Plays the carousel in once, when it first comes into view below the fold.
// `index` is a ref to the front card's index.
export default function useEntrance({ count, loop, deepest, index }) {
  const ref = useRef(null);
  const played = useRef(false);
  const [cards, cardsApi] = useSprings(count, () => ({ e: 0, f: 1 }));
  const [bar, barApi] = useSpring(() => ({ o: 1, y: 0 }));
  // True only for hydration, when Reveal's pre-paint script has already held
  // the carousel or left it be; a client render decides for itself.
  const hydrating = useSyncExternalStore(
    subscribe,
    () => false,
    () => true
  );
  const adopt = useRef(hydrating);

  useLayoutEffect(() => {
    const el = ref.current;
    // The hold Reveal's pre-paint script put on the module's wrapper.
    const pre = el
      .closest('[data-entrance]')
      ?.getAnimations()
      .find((a) => a.id === 'entrance');
    if (played.current || !el.closest('[data-reveal]')) {
      pre?.cancel();
      return;
    }

    let armed = false;
    let run = 0;
    let observers = [];
    let live = true;
    // The animation hiding it until the springs take over: Reveal's pre-paint
    // one, or one of its own after a client navigation.
    let hold = null;
    const depth = (i) => behind(i, index.current, count, loop);
    const drawn = (i) => depth(i) >= 0 && depth(i) <= deepest;
    const still = () => matchMedia(STILL).matches;
    const done = (gen) => {
      if (gen !== run) return;
      armed = false;
      delete el.dataset.entering;
    };
    const unobserve = () => observers.forEach((o) => o.disconnect());

    // Back to rest from wherever it is, keeping its speed.
    const settle = (now = false) => {
      // An observer may still deliver an entry after cleanup.
      if (!live || (!armed && !hold)) return;
      played.current = true;
      // Still to be set up: it simply stays at rest.
      if (!armed) {
        hold.cancel();
        hold = null;
        return;
      }
      unobserve();
      const gen = ++run;
      const to = { delay: 0, config: SNAP, immediate: now };
      Promise.all([
        ...cardsApi.start({ e: 0, f: 1, ...to }),
        ...barApi.start({ o: 1, y: 0, ...to })
      ]).then(() => done(gen));
    };
    const interrupt = () => settle();
    // Not eased where it would be wasted, or would hide a focused control.
    const snap = () => settle(true);
    const restore = (event) => event.persisted && snap();

    // The drawn cards' pictures, decoded or given up on, so none slots in blank.
    const decoded = () => {
      const imgs = [...el.querySelectorAll(`.${styles.card}`)]
        .filter((_, i) => drawn(i))
        .flatMap((card) => [...card.querySelectorAll('img')]);
      return Promise.race([
        Promise.all(imgs.map((img) => img.decode().catch(() => {}))),
        new Promise((resolve) => setTimeout(resolve, 400))
      ]);
    };

    const play = async () => {
      if (!live) return;
      unobserve();
      const gen = ++run;
      if (still()) {
        played.current = true;
        // The hold may have offset it before reduced motion turned on.
        cardsApi.set({ e: 0 });
        barApi.set({ y: 0 });
        el.dataset.entering = '';
        await Promise.all([
          ...cardsApi.start({ f: 1, config: fade(250) }),
          ...barApi.start({ o: 1, config: fade(250) })
        ]);
        return done(gen);
      }
      await decoded();
      if (gen !== run) return;
      // Only now played: a run torn down while decoding leaves it to the next.
      played.current = true;
      el.dataset.entering = '';
      await Promise.all([
        ...cardsApi.start((i) =>
          drawn(i)
            ? { e: 0, f: 1, ...card(depth(i), deepest) }
            : { e: 0, f: 1, immediate: true }
        ),
        ...barApi.start({ o: 1, y: 0, delay: BAR.delay, config: BAR.config })
      ]);
      done(gen);
    };

    // Measured once the router has scrolled after a client navigation; on a
    // full load, Reveal's script measured before the first paint and held it.
    queueMicrotask(() => {
      if (!live) return;
      if (adopt.current) hold = pre;
      else if (el.getBoundingClientRect().top > innerHeight * 0.9)
        hold = el.animate({ opacity: 0 }, { fill: 'forwards' });
      adopt.current = false;
      // Already on screen: it stays as it is.
      if (!hold) return;
      // Decided next frame, before it paints, as a Back or Forward is only
      // flagged once the router has rendered the page. It shows at rest.
      requestAnimationFrame(() => {
        if (!live || !hold) return;
        if (traversed) return settle();
        armed = true;
        if (still()) {
          cardsApi.set({ f: 0 });
          barApi.set({ o: 0 });
        } else {
          cardsApi.set((i) => (drawn(i) ? { e: 1, f: 0 } : {}));
          barApi.set({ o: 0, y: BAR.rise });
        }
        // The springs hold it from the frame after.
        requestAnimationFrame(() => {
          hold?.cancel();
          hold = null;
        });
        // Taller than the viewport, it may never be 30% in view.
        const threshold =
          el.getBoundingClientRect().height > innerHeight ? 0.1 : 0.3;
        // Scrolled past without being seen: nothing is left to arrive. A root
        // reaching far above the viewport catches a jump that never touches it.
        observers = [
          new IntersectionObserver(
            ([entry]) => {
              if (entry.boundingClientRect.bottom < 0) snap();
              else if (entry.intersectionRatio >= threshold) play();
            },
            { threshold: [0, threshold] }
          ),
          new IntersectionObserver(
            ([entry]) =>
              entry.isIntersecting &&
              entry.boundingClientRect.bottom < 0 &&
              snap(),
            { rootMargin: '100000px 0px 0px 0px' }
          )
        ];
        observers.forEach((o) => o.observe(el));
      });
    });

    el.addEventListener('pointerdown', interrupt, true);
    el.addEventListener('keydown', interrupt, true);
    el.addEventListener('focusin', snap);
    addEventListener('pageshow', restore);
    addEventListener('beforeprint', snap);
    return () => {
      live = false;
      run++;
      unobserve();
      // Torn down before it played: back at rest, for the next run to decide.
      hold?.cancel();
      if (armed && !played.current) {
        cardsApi.set({ e: 0, f: 1 });
        barApi.set({ o: 1, y: 0 });
      }
      delete el.dataset.entering;
      el.removeEventListener('pointerdown', interrupt, true);
      el.removeEventListener('keydown', interrupt, true);
      el.removeEventListener('focusin', snap);
      removeEventListener('pageshow', restore);
      removeEventListener('beforeprint', snap);
    };
  }, [count, loop, deepest, index, cardsApi, barApi]);

  return { ref, cards, bar };
}

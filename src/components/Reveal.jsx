'use client';

import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { hold, play } from '@/lib/reveal';
import { revealWatch } from '@/lib/revealWatch';

// Back and Forward bring a page back as it was left, so nothing enters. The
// next reveal run uses the flag up.
let traversed = false;
if (typeof window !== 'undefined')
  addEventListener('popstate', () => (traversed = true));

const subscribe = () => () => {};

// Plays each held unit in, in reading order, as it crosses the reveal line.
export default function Reveal() {
  // True only for the server render and hydration: inline scripts never run on
  // a client render, so after a client navigation the effect holds the units.
  const hydrating = useSyncExternalStore(
    subscribe,
    () => false,
    () => true
  );
  const adopt = useRef(hydrating);

  useLayoutEffect(() => {
    const waiting = new Set();
    const running = new Set();
    const played = new Map();
    let observer;
    let focus;
    let live = true;

    const appear = (unit) => {
      waiting.delete(unit);
      observer.unobserve(unit[0]);
      unit[2].cancel();
    };
    const show = (unit, delay) => {
      const anims = play(unit, delay);
      appear(unit);
      played.set(unit, anims);
      for (const a of anims) {
        running.add(a);
        a.finished.then(
          () => running.delete(a),
          () => {}
        );
      }
    };
    const flush = () => {
      waiting.forEach(appear);
      running.forEach((a) => a.cancel());
    };

    const start = () => {
      // From here Reveal owns the holds, so the pre-paint script stops adding.
      if (adopt.current) window.__revealWatch?.disconnect();
      const pending = hold(adopt.current);
      if (!pending.length) return;
      pending.forEach((unit) => waiting.add(unit));
      const index = new Map(pending.map((unit, i) => [unit[0], i]));
      let next = 0;
      observer = new IntersectionObserver(
        (entries) => {
          const hits = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => index.get(entry.target))
            .sort((a, b) => a - b);
          if (!hits.length) return;
          // Anything skipped past in a jump or a fling appears at once rather
          // than staying hidden above the viewport.
          for (const unit of pending.slice(0, hits.at(-1)))
            if (waiting.has(unit) && unit[0].getBoundingClientRect().bottom < 0)
              appear(unit);
          const now = performance.now();
          for (const i of hits) {
            const unit = pending[i];
            if (!waiting.has(unit)) continue;
            // A unit never starts before the one above it.
            const delay = Math.min(Math.max(0, next - now), 300);
            next = now + delay + (unit[1] === 'item' ? 50 : 80);
            show(unit, delay);
          }
        },
        { rootMargin: '0px 0px -10% 0px' }
      );
      pending.forEach((unit) => observer.observe(unit[0]));
      // Focus doesn't scroll a control that is already on screen, so one
      // tabbed to under the reveal line would stay invisible. It and the units
      // above it appear at once, even mid-entrance: a focus ring is feedback
      // and can't wait.
      focus = ({ target }) => {
        const last = pending.findIndex(
          (unit) =>
            (waiting.has(unit) || played.has(unit)) && unit[0].contains(target)
        );
        for (const unit of pending.slice(0, last + 1)) {
          if (waiting.has(unit)) appear(unit);
          played.get(unit)?.forEach((a) => a.cancel());
        }
      };
      addEventListener('focusin', focus);
      addEventListener('beforeprint', flush);
    };

    // After a client navigation the router scrolls once every layout effect
    // has run; measure after that, still before paint.
    if (adopt.current) start();
    else if (traversed) setTimeout(() => (traversed = false), 0);
    else queueMicrotask(() => live && start());

    return () => {
      live = false;
      observer?.disconnect();
      removeEventListener('beforeprint', flush);
      removeEventListener('focusin', focus);
      running.forEach((a) => a.cancel());
      // Deferred, so a Strict Mode remount in the same task can adopt the
      // holds; after a real unmount nothing may stay hidden.
      const left = [...waiting];
      queueMicrotask(() => left.forEach((unit) => unit[2].cancel()));
    };
  }, []);

  return hydrating ? (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: revealWatch }}
    />
  ) : null;
}

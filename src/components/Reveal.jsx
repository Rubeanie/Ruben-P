'use client';

import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { hold } from '@/lib/reveal';

// The Sass $ease-out token.
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

// Runs before first paint on a full load, except one from Back or Forward.
// If the app never hydrates to take the holds over, everything shows after
// five seconds.
const script = `(function(h){setTimeout(function(){h.forEach(function(u){u[2].cancel()})},5000)})(performance.getEntriesByType('navigation')[0]?.type==='back_forward'?[]:(${hold})())`;

// Back and Forward bring a page back as it was left, so nothing enters. The
// next reveal run uses the flag up.
let traversed = false;
if (typeof window !== 'undefined')
  addEventListener('popstate', () => (traversed = true));

const subscribe = () => () => {};

const filtered = (el, pseudo) => {
  const value = getComputedStyle(el, pseudo).backdropFilter;
  return Boolean(value) && value !== 'none';
};
const pseudoGlass = (el) => filtered(el, '::before') || filtered(el, '::after');
const glass = (el) => filtered(el) || pseudoGlass(el);

// An element still to play its own fade-in is left to it.
const fadesItself = (el) =>
  el
    .getAnimations()
    .some(
      (a) =>
        a.effect?.getKeyframes().some((k) => 'opacity' in k) &&
        (a.effect.getComputedTiming().progress ?? 1) < 1
    );

// Opacity below 1 on an ancestor of a backdrop-filter makes that ancestor the
// glass's backdrop root, and the blur only snaps on when the fade ends. So a
// unit holding glass is faded piecewise: every branch without glass fades as
// one, and a glass element fades itself (its blur crossfades in, no snap).
function fadeTargets(el) {
  if (fadesItself(el)) return [];
  return pseudoGlass(el) || [...el.querySelectorAll('*')].some(glass)
    ? [...el.children].flatMap(fadeTargets)
    : [el];
}

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
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    // Web Animations rather than transitions: each runs from the held value to
    // whatever the element's own styles say (muted text at 0.7, a zoom card's
    // rest scale), and it sits above a module's own CSS animation.
    const show = (unit, delay) => {
      const [el] = unit;
      const { translate, scale } = getComputedStyle(el);
      appear(unit);
      const timing = (duration) => ({
        duration: still ? 300 : duration,
        easing: EASE_OUT,
        delay,
        fill: 'backwards'
      });
      const anims = [];
      if (!still)
        anims.push(el.animate([{ translate, scale, offset: 0 }], timing(700)));
      // A rich text block of media fades as one piece: split up, its dark
      // plate showed solid while the picture inside was still faint.
      const block = el.parentElement?.dataset.revealChildren === 'blocks';
      const fades =
        block && el.querySelector('img, video, iframe')
          ? [el]
          : fadeTargets(el);
      for (const node of fades)
        anims.push(node.animate([{ opacity: 0, offset: 0 }], timing(500)));
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
      dangerouslySetInnerHTML={{ __html: script }}
    />
  ) : null;
}

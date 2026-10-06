'use client';

import { useEffect, useRef } from 'react';
import { animated, to, useSpring } from '@react-spring/web';
import { DEPTH, depthOf, PERSPECTIVE } from '@/lib/carousel';
import { aimFor, behind, mod } from './loop';
import { pose } from './entrance';
import useReducedMotion from '@/lib/useReducedMotion';
import styles from '@/styles/components/MediaCarousel.module.scss';

// Critically damped, settling in about 520ms.
const SETTLE = { frequency: 0.42, damping: 1, velocity: 0 };
// A flick carries momentum, so it may overshoot a touch.
const FLING = { frequency: 0.42, damping: 0.86 };
// Buttons and keys are a deliberate step, a little slower than a drag release.
const STEP_SETTLE = { frequency: 0.36, damping: 1, velocity: 0 };
// Pointer travel before a press becomes a drag, and the flick speed (px/ms)
// that moves a card however short the drag.
const SLOP = 8;
const FLICK = 0.11;
// Drag distance per card, as a share of the card's width.
const STEP = 0.5;
// Reduced motion: how far the card follows a drag at most, in px.
const FOLLOW = 24;
// A passed card shrinks towards its own left edge as it fades, so it never
// leaves the box; it is gone by the time it is this far past.
const PASSED_SCALE = 0.1;
const PASSED_FADE = 0.6;

// A player or scene on the front card keeps the gesture to itself.
const LIVE = '[data-front] :is(iframe, canvas)';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Past either end the stack follows less the further it is pulled.
const rubberband = (over) => (over * 0.55) / (1 + 0.55 * Math.abs(over));

export default function StackTrack({
  items,
  index,
  onIndex,
  onWarm,
  onReach,
  loop,
  renderSlide,
  entrance
}) {
  const deck = useRef(null);
  const reduced = useReducedMotion();
  const [{ pos }, api] = useSpring(() => ({ pos: index, config: SETTLE }));
  // Reduced motion has no stack to drag, so the card only leans with the finger.
  const [{ lean }, leanApi] = useSpring(() => ({ lean: 0, config: SETTLE }));
  const drag = useRef(null);
  const swallowClick = useRef(false);
  const n = items.length;
  const last = n - 1;
  const { place, deepest } = depthOf(n, loop);
  const depthAt = (i, p) => behind(i, p, n, loop);

  // Reduced motion hides the cards behind until here, so the server's stack
  // never flashes out to the side.
  useEffect(() => {
    deck.current.dataset.ready = '';
  }, []);

  // Buttons, keys, dots and clicks move the index; a released drag has already aimed.
  useEffect(() => {
    if (mod(Math.round(pos.goal), n) === index) return;
    api.start({
      pos: aimFor(pos.goal, index, n, loop),
      immediate: reduced,
      config: STEP_SETTLE
    });
  }, [index, reduced, pos, api, n, loop]);

  // `e` is how much of the entrance this card has still to play.
  const transformFor = (rest, e) => {
    const { xk, scale } = pose(e);
    if (rest < 0) {
      const s = 1 + rest * PASSED_SCALE;
      // Shrinking about the centre, pulled back so the left edge holds still.
      return `translate3d(calc(var(--u) * ${-150 * (1 - s)}), 0, 0) scale(${s})`;
    }
    const { x, z, turn } = place(rest);
    return `translate3d(calc(var(--u) * ${x * xk}), 0, calc(var(--u) * ${z})) rotateY(${turn}deg) scale(${scale})`;
  };

  // Fades out on the way past and in at the back, where it rests on the
  // deepest visible card, so nothing appears or leaves at the box's edge.
  const opacityFor = (d) => {
    if (d < 0) return clamp(1 + d / PASSED_FADE, 0, 1);
    return clamp(deepest + 1 - d, 0, 1);
  };

  const onPointerDown = (event) => {
    // A touch pan fires no click, so a swallow left over must not eat this tap.
    swallowClick.current = false;
    if (drag.current?.moving || event.button !== 0) return;
    // Over a live player or scene the buttons, dots and back cards still move the stack.
    if (deck.current.querySelector(LIVE)) return;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      from: 0,
      step: deck.current.firstElementChild.offsetWidth * STEP,
      moving: false,
      // The card position last reported as reached.
      reachedAt: null,
      samples: [{ x: event.clientX, t: event.timeStamp }]
    };
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    let dx = event.clientX - state.x;
    const dy = event.clientY - state.y;

    if (!state.moving) {
      if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null;
        return;
      }
      if (Math.abs(dx) < SLOP) return;
      state.moving = true;
      // The drag starts where it is recognised, so a card still settling
      // from the last release doesn't jump under the finger.
      state.from = pos.get();
      state.x = event.clientX;
      dx = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    state.samples.push({ x: event.clientX, t: event.timeStamp });
    state.samples = state.samples.filter((s) => event.timeStamp - s.t < 100);
    if (reduced) {
      leanApi.start({
        lean: FOLLOW * Math.tanh((dx * 4) / state.step),
        immediate: true
      });
      return;
    }

    const raw = state.from - dx / state.step;
    const held = loop ? raw : clamp(raw, 0, last);
    api.start({ pos: held + rubberband(raw - held), immediate: true });
    // Mounts the media of the cards it drags into view.
    const at = Math.round(held);
    if (at !== state.reachedAt) onReach(mod((state.reachedAt = at), n));
  };

  // The drag this pointer was making, ended; null if it never became one.
  const endDrag = (event) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return null;
    drag.current = null;
    if (!state.moving) return null;
    if (reduced) leanApi.start({ lean: 0 });
    return state;
  };

  const onPointerUp = (event) => {
    const state = endDrag(event);
    if (!state) return;
    swallowClick.current = true;

    const [first] = state.samples;
    const elapsed = Math.max(1, event.timeStamp - first.t);
    const velocity = (event.clientX - first.x) / elapsed;
    const now = state.from - (event.clientX - state.x) / state.step;
    const start = Math.round(state.from);
    // Where a flick of this speed would coast to, then the card nearest it.
    let target = Math.round(now - (velocity * 99) / state.step);
    // A flick only commits the way the card was dragged; reversing cancels it.
    const dragged = Math.sign(now - start);
    if (
      Math.abs(velocity) > FLICK &&
      target === start &&
      Math.sign(-velocity) === dragged
    ) {
      target = start + dragged;
    }
    if (!loop) target = clamp(target, 0, last);
    // A flick coasts past every card between here and where it lands; under
    // reduced motion it swaps straight there.
    const at = loop ? Math.round(now) : clamp(Math.round(now), 0, last);
    if (!reduced)
      for (let k = Math.min(at, target); k <= Math.max(at, target); k++)
        onReach(mod(k, n));

    api.start({
      pos: target,
      immediate: reduced,
      config: { ...FLING, velocity: -velocity / state.step }
    });
    onIndex(mod(target, n));
  };

  // The browser took the gesture over (a scroll, a system swipe): back to the
  // current card, no flick.
  const onPointerCancel = (event) => {
    if (!endDrag(event)) return;
    api.start({
      pos: aimFor(pos.get(), index, n, loop),
      immediate: reduced,
      config: SETTLE
    });
  };

  // The click that ends a drag is not a press on a card.
  const onClickCapture = (event) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={deck}
      className={styles.deck}
      style={{ '--perspective': PERSPECTIVE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClickCapture={onClickCapture}>
      {items.map((item, i) => {
        const active = i === index;
        const { e, f } = entrance.cards[i];
        const style = reduced
          ? { opacity: active ? f : 0, zIndex: active ? 1 : 0, x: lean }
          : {
              transform: to([pos, e], (p, v) => transformFor(depthAt(i, p), v)),
              opacity: to([pos, f], (p, v) => opacityFor(depthAt(i, p)) * v),
              zIndex: pos.to((p) => Math.round(100 - depthAt(i, p) * 10)),
              visibility: pos.to((p) =>
                opacityFor(depthAt(i, p)) > 0.001 ? 'visible' : 'hidden'
              )
            };
        return (
          <animated.div
            key={item.key}
            className={styles.card}
            data-front={active || undefined}
            data-reduced={reduced || undefined}
            // A card behind is a target: a press brings it forward.
            onClick={active ? undefined : () => onIndex(i)}
            onPointerEnter={active ? undefined : () => onWarm(i)}
            style={style}>
            {renderSlide(item, i, active)}
            {!reduced && (
              <animated.span
                className={styles.shade}
                style={{
                  '--shade': pos.to(
                    (p) =>
                      clamp(depthAt(i, p), 0, DEPTH.visible) * DEPTH.falloff
                  )
                }}
              />
            )}
          </animated.div>
        );
      })}
    </div>
  );
}

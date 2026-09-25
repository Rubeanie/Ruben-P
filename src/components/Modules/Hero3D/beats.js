// On the move's own progress loop, so the beats resolve even when the canvas stops
// drawing. Only transform, opacity and filter are written; positions are read on resize.

// Where each beat plays, in e: [in from, in to] and [out from, out to]. Each holds while
// what is behind it is dark: the mark dim late in the turn, the lit rim out at the edges.
const WINDOWS = {
  turn: { in: [0.15, 0.25], out: [0.44, 0.5] },
  approach: { in: [0.73, 0.8], out: [0.947, 0.971] }
};
// Once an exit starts it takes at least this long (s), so a fast scroll still
// reads it; it plays back if the page scrolls up again. A fast scroll starts it
// early, as soon as the first heading after the section would reach the beat's
// foot within it (with LEAD to spare), so it's done before then; that early
// start holds until the page is scrolled BACK px back up.
const EXIT = 0.35;
const LEAD = 1.25;
const BACK = 48;
// Whatever the speed, an exit is done by the time that heading reaches the
// beat's foot: px of approach over which it's forced.
const GUARD = 48;
// Word stagger, as a share of the entrance, and the most the whole spread may
// take, so a long heading staggers tighter instead of never landing.
const STAGGER = 0.14;
const SPREAD = 0.42;

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// $ease-out, cubic-bezier(0.23, 1, 0.32, 1), solved for x by bisection.
const bezier = (a, b, t) =>
  ((1 + 3 * a - 3 * b) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
function easeOut(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const t = (lo + hi) / 2;
    if (bezier(0.23, 0.32, t) < x) lo = t;
    else hi = t;
  }
  return bezier(1, 1, (lo + hi) / 2);
}

// Word i of n's share of an entrance at t, staggered.
function staggered(t, i, n) {
  const step = n > 1 ? Math.min(STAGGER, SPREAD / (n - 1)) : 0;
  return clamp01((t - i * step) / (1 - (n - 1) * step));
}

// Inline styles last written, so a settled beat costs no style writes.
const written = new WeakMap();
function write(el, prop, value) {
  const last = written.get(el) ?? {};
  if (last[prop] === value) return;
  el.style[prop] = value;
  written.set(el, { ...last, [prop]: value });
}

// Settled text carries no transform, opacity or filter, so it rests on whole
// pixels on its own layer-free paint: crisp, and nothing left to jitter.
function set(el, dy, unit, opacity, blur = 0) {
  write(
    el,
    'transform',
    Math.abs(dy) < 0.05 ? '' : `translate3d(0, ${dy.toFixed(1)}${unit}, 0)`
  );
  write(el, 'opacity', opacity > 0.999 ? '' : opacity.toFixed(3));
  write(el, 'filter', blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '');
}

function reveal(beat, tin, tout) {
  const n = beat.words.length;
  let landed = 1;
  beat.words.forEach((word, i) => {
    const u = Math.min(
      easeOut(staggered(tin, i, n)),
      1 - easeOut(staggered(tout, n - 1 - i, n))
    );
    set(word, (1 - u) * 110, '%', u, (1 - u) * 8);
    landed = Math.min(landed, u);
  });
  // Spacing closes up as the last word lands: 3% wide to true.
  write(
    beat.heading,
    'transform',
    landed > 0.999 ? '' : `scaleX(${(1 + 0.03 * (1 - landed)).toFixed(4)})`
  );
  const u = Math.min(
    easeOut(clamp01((tin - 0.35) / 0.65)),
    1 - easeOut(clamp01(tout / 0.6))
  );
  set(beat.lead, (1 - u) * 16, 'px', u, (1 - u) * 4);
}

// Starts the section's beats on the move's progress; returns their teardown.
export default function createBeats(progress, section) {
  const root = section?.querySelector('[data-beats]');
  if (!root) return () => {};
  const beats = [...root.querySelectorAll('[data-beat]')]
    .filter((el) => WINDOWS[el.dataset.beat])
    .map((el) => ({
      el,
      window: WINDOWS[el.dataset.beat],
      heading: el.querySelector('[data-heading]'),
      words: [...el.querySelectorAll('[data-word]')],
      lead: el.querySelector('[data-lead]'),
      hidden: null,
      out: 0,
      latch: null
    }));
  // The first heading after the section, in page coordinates.
  const next = [...document.querySelectorAll('h1, h2, h3')].find(
    (h) =>
      !section.contains(h) &&
      section.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING
  );
  let nextTop = Infinity;
  // Positions go stale on any layout change (resize, a late font swap, the
  // reduced-motion layout); they're read again on the next tick.
  let stale = true;
  const measure = () => {
    stale = false;
    for (const beat of beats)
      beat.foot = beat.el.getBoundingClientRect().bottom;
    nextTop = next ? next.getBoundingClientRect().top + scrollY : Infinity;
  };
  let styled = false;

  function update({ e, y, speed, dt, reduced }) {
    if (reduced) return clear();
    if (stale) measure();
    styled = true;
    let moving = false;
    for (const beat of beats) {
      const w = beat.window;
      const tin = clamp01((e - w.in[0]) / (w.in[1] - w.in[0]));
      const target = clamp01((e - w.out[0]) / (w.out[1] - w.out[0]));
      const gap = nextTop - y - beat.foot;
      // Scrolling down fast with the heading close: the exit starts now and
      // stays started (speed only ever advances it) until the page is scrolled
      // back up BACK px from the furthest it got since.
      if (
        beat.latch === null &&
        speed > 0 &&
        gap < innerHeight / 2 &&
        gap < speed * EXIT * LEAD
      )
        beat.latch = y;
      else if (beat.latch !== null && y < beat.latch - BACK) beat.latch = null;
      else if (beat.latch !== null) beat.latch = Math.max(beat.latch, y);
      const goal = beat.latch === null ? target : 1;
      // Before its entrance, or on the first frame, a beat takes the state for
      // the current progress; otherwise its exit moves towards the goal no
      // faster than EXIT allows, either way.
      if (tin === 0 || dt === 0) beat.out = target;
      else
        beat.out += Math.max(-dt / EXIT, Math.min(dt / EXIT, goal - beat.out));
      if (Math.abs(goal - beat.out) > 1e-4) moving = true;
      const tout = Math.max(beat.out, clamp01(1 - gap / GUARD));
      const hidden = tin === 0 || tout === 1;
      if (hidden !== beat.hidden)
        write(
          beat.el,
          'visibility',
          (beat.hidden = hidden) ? 'hidden' : 'visible'
        );
      if (!hidden) reveal(beat, tin, tout);
    }
    return moving;
  }
  // Reduced motion: back to the stylesheet's static, readable beats.
  function clear() {
    if (!styled) return false;
    styled = false;
    stale = true;
    for (const beat of beats) {
      Object.assign(beat, { hidden: null, latch: null });
      for (const el of [beat.el, beat.heading, beat.lead, ...beat.words]) {
        el.removeAttribute('style');
        written.delete(el);
      }
    }
    return false;
  }
  const layout = new ResizeObserver(() => {
    stale = true;
    progress.wake();
  });
  for (const el of [document.body, root, ...beats.map((beat) => beat.el)])
    layout.observe(el);
  const off = progress.listen(update);
  return () => {
    off();
    layout.disconnect();
  };
}

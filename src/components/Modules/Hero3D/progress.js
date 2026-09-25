import { ease } from '@/lib/hero3d';

// Viewports of scroll the move runs over. The content after the section starts
// scrolling up over the fixed canvas before the end (Hero3D.module.scss).
export const RANGE = 2.1;
// Rate of the two cascaded dampers on the scroll, per second.
const FOLLOW = 10;
// Longer than this between frames is a real stall (a background tab, a frozen
// page), not a slow frame.
const STALL = 1000;

const damp = (x, y, dt) => x + (y - x) * (1 - Math.exp(-FOLLOW * dt));
// Seconds since the last step, capped so a slow frame still moves (at most
// 100ms at once).
const since = (now, last) => (last ? Math.min(now - last, 100) / 1000 : 0);

// Scroll over RANGE stage heights (100lvh, so phone toolbars don't change it) through
// two cascaded dampers, so wheel steps ease out with no kink; its own loop settles it
// whether or not the canvas draws. listen(f): f returns true while it needs frames.
export default function createProgress(stage) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { p: 0, e: 0, y: 0, speed: 0, dt: 0, reduced: reduced.matches };
  const listeners = new Set();
  let height = stage.clientHeight;
  let q = null;
  let last = 0;
  let ticked = 0;
  let frame = 0;
  let asked = 0;

  // Brings the progress up to now. The rig samples it every frame it draws and
  // the loop below on every tick, in either order: the two dampers are solved
  // exactly for the step (q - raw decays as exp(-kt), p - raw as
  // (b + k a t) exp(-kt)), so any split of the time gives the same result.
  function sample() {
    const now = performance.now();
    if (last && now - last > STALL) q = null;
    const dt = since(now, last);
    last = now;
    state.reduced = reduced.matches;
    if (state.reduced) {
      q = null;
      state.p = state.e = 0;
      return 0;
    }
    const raw = Math.min(1, Math.max(0, scrollY / (RANGE * height)));
    // A load, a reload mid-page or reduced motion turned off starts on the
    // scroll position.
    if (q === null) q = state.p = raw;
    const decay = Math.exp(-FOLLOW * dt);
    const a = q - raw;
    state.p = raw + (state.p - raw + FOLLOW * dt * a) * decay;
    q = raw + a * decay;
    state.e = ease(state.p);
    return raw;
  }
  function tick(now) {
    frame = 0;
    // A frame asked for that took a stall to come (the tab was in the
    // background) starts on the scroll position too.
    if (performance.now() - asked > STALL) q = null;
    const raw = sample();
    const dt = ticked && now - ticked < STALL ? since(now, ticked) : 0;
    ticked = now;
    state.speed = dt ? damp(state.speed, (scrollY - state.y) / dt, dt) : 0;
    state.y = scrollY;
    state.dt = dt;
    let moving = Math.abs(raw - state.p) > 1e-4 || Math.abs(state.speed) > 1;
    for (const f of listeners) moving = f(state) || moving;
    if (moving) {
      asked = performance.now();
      frame = requestAnimationFrame(tick);
    }
    // Settled: the next change starts afresh, not as one long step.
    else last = ticked = 0;
  }
  const wake = () => {
    if (frame) return;
    asked = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    height = stage.clientHeight;
    wake();
  };
  const resync = () => {
    if (document.visibilityState !== 'visible') return;
    q = null;
    last = ticked = 0;
    state.speed = 0;
    wake();
  };

  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', resize);
  reduced.addEventListener('change', wake);
  document.addEventListener('visibilitychange', resync);
  addEventListener('pageshow', resync);
  document.addEventListener('resume', resync);
  wake();
  return {
    sample() {
      sample();
      return state;
    },
    wake,
    listen(f) {
      listeners.add(f);
      wake();
      return () => listeners.delete(f);
    },
    stop() {
      cancelAnimationFrame(frame);
      listeners.clear();
      removeEventListener('scroll', wake);
      removeEventListener('resize', resize);
      reduced.removeEventListener('change', wake);
      document.removeEventListener('visibilitychange', resync);
      removeEventListener('pageshow', resync);
      document.removeEventListener('resume', resync);
    }
  };
}

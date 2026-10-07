// Shared by the announcement marquee and the dashed drop zone: a 0..1 rate that
// eases to a stop or back up to speed.
const STOP_MS = 400;
const RESUME_MS = 800;

const easeOutCubic = (p) => 1 - (1 - p) ** 3;
// velocity leaves and reaches its target with zero acceleration
const easeInOut = (p) => p * p * (3 - 2 * p);

// A partial change takes its share of the time; null when there is nothing to tween.
export function rateTween(from, moving, now) {
  const to = moving ? 1 : 0;
  const ms = (moving ? RESUME_MS : STOP_MS) * Math.abs(to - from);
  const curve = moving ? easeInOut : easeOutCubic;
  return ms ? { from, to, t0: now, ms, curve } : null;
}

// The rate at `now`, and whether the tween has finished.
export function stepRate({ from, to, t0, ms, curve }, now) {
  const p = Math.min(1, (now - t0) / ms);
  return [from + (to - from) * curve(p), p === 1];
}

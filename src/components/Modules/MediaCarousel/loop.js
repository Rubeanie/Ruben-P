export const mod = (value, n) => ((value % n) + n) % n;

// The index `by` steps from `index`, wrapped on a loop; null past either end
// of a row that doesn't wrap.
export function stepFrom(index, by, n, loop) {
  const raw = index + by;
  if (!loop && (raw < 0 || raw >= n)) return null;
  return mod(raw, n);
}

// How far card i sits behind the front one at position p; negative once
// passed. A loop folds it into [-1, n - 1).
export const behind = (i, p, n, loop) => (loop ? mod(i - p + 1, n) - 1 : i - p);

// The spring position that shows `index` from the current goal: the short way
// round a loop, forwards on a tie.
export function aimFor(goal, index, n, loop) {
  if (!loop) return index;
  const from = Math.round(goal);
  const half = Math.floor(n / 2);
  return from + half - mod(half - (index - from), n);
}

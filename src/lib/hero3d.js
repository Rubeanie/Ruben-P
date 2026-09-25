// Pure helpers for the Hero (3D) move, shared by the rig and the text beats
// without pulling in three.js.

// One ease over the whole move; holds come from repeated keys.
export const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

// Monotone cubic through (t, v) keys (Fritsch-Carlson): no overshoot, and a
// repeated value is a true hold.
export function track(keys) {
  const n = keys.length;
  const d = keys
    .slice(1)
    .map((k, i) => (k[1] - keys[i][1]) / (k[0] - keys[i][0]));
  const m = keys.map((_, i) => {
    if (i === 0) return d[0];
    if (i === n - 1) return d[n - 2];
    return d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      m[i] = (3 / Math.sqrt(s)) * a * d[i];
      m[i + 1] = (3 / Math.sqrt(s)) * b * d[i];
    }
  }
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0];
    const u = (t - keys[i][0]) / h;
    const u2 = u * u;
    const u3 = u2 * u;
    return (
      (2 * u3 - 3 * u2 + 1) * keys[i][1] +
      (u3 - 2 * u2 + u) * h * m[i] +
      (-2 * u3 + 3 * u2) * keys[i + 1][1] +
      (u3 - u2) * h * m[i + 1]
    );
  };
}

// The scroll turn runs on raw progress p rather than the cosine ease, so it
// answers the first pixels of scroll: it leaves 0 at TURN_START times its
// average rate and settles onto the face at p 0.5 (e 0.5).
const TURN_END = 0.5;
const TURN_START = 0.8;
export function turnAt(p) {
  const x = Math.min(1, Math.max(0, p / TURN_END));
  return x * (TURN_START + x * (3 - 2 * TURN_START + x * (TURN_START - 2)));
}

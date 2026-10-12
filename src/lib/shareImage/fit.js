const TRACK = -0.02;

// Where Satori sets a line's baseline in its box: the hhea content area centred in the line height.
export const baseline = ({ ascender, descender }, size, lineHeight) =>
  ((lineHeight - (ascender - descender)) / 2 + ascender) * size;

// `measure` gives a string's advance in em.
export const lineWidth = (measure, text, size) =>
  (measure(text) + TRACK * Math.max(0, [...text].length - 1)) * size;

const ellipsise = (text, fits) => {
  let t = text;
  while (t.length > 1 && !fits(`${t.trimEnd()}…`)) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
};

const wrap = (fits, words) =>
  words.reduce((lines, word) => {
    const last = lines.at(-1);
    if (last && fits(`${last} ${word}`))
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
    return lines;
  }, []);

// The two-line break whose longer line is shortest.
function balance(width, words) {
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    const w = Math.max(...lines.map(width));
    if (!best || w < best.w) best = { w, lines };
  }
  return best.lines;
}

// Up to two lines at the largest even size that fits, never under `min`, balanced;
// past that the lines are kept at `min` and the second is cut.
export function fitTitle(measure, text, { width, max, min }) {
  const words = String(text ?? '')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return { size: max, lines: [] };
  for (let size = max; size >= min; size -= 2) {
    const fits = (t) => lineWidth(measure, t, size) <= width;
    const lines = wrap(fits, words);
    if (lines.length <= 2 && lines.every(fits))
      return {
        size,
        lines:
          lines.length === 1
            ? lines
            : balance((t) => lineWidth(measure, t, size), words)
      };
  }
  const fits = (t) => lineWidth(measure, t, min) <= width;
  const [first, ...rest] = wrap(fits, words);
  return {
    size: min,
    lines: [first, rest.join(' ')]
      .filter(Boolean)
      .map((l) => (fits(l) ? l : ellipsise(l, fits)))
  };
}

// One line of tags: those that don't fit fold into "+N", and a first tag too long for the line is cut.
export function fitTags(titles, room, { tagWidth, plusWidth, gap }) {
  const reserve = (rest) => (rest ? plusWidth(rest) + gap : 0);
  const shown = [];
  let used = 0;
  for (let i = 0; i < titles.length; i++) {
    const w = tagWidth(titles[i]) + (shown.length ? gap : 0);
    if (used + w + reserve(titles.length - i - 1) > room) break;
    shown.push(titles[i]);
    used += w;
  }
  if (titles.length && !shown.length) {
    const budget = room - reserve(titles.length - 1);
    shown.push(ellipsise(titles[0], (t) => tagWidth(t) <= budget));
  }
  return { shown, more: titles.length - shown.length };
}

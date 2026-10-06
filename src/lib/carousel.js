import { PHONE } from '@/lib/coverSizes';

// Depth is drawn for a 300-unit card (150 either side of its centre); the
// stylesheet turns units into pixels from the real card's width, so a phone
// and a desktop see the same stack.
export const PERSPECTIVE = 1600;
const HALF = 150;

// Recedes deep rather than fanning wide, so the front card keeps about 88% of the row.
export const DEPTH = {
  depth: 300,
  spread: 52,
  tilt: 16,
  // How much darker each card behind gets.
  falloff: 0.2,
  visible: 3
};

// Where a card d places behind the front one sits, and how much room the
// stack needs beside the front card so its far edge stays in the box.
export function depthOf(count, loop) {
  const { depth, spread, tilt, visible } = DEPTH;
  // A loop keeps one card out of sight to come round, so it shows one fewer.
  const deepest = Math.max(0, Math.min(visible, count - (loop ? 2 : 1)));

  const place = (d) => {
    const at = Math.min(d, deepest);
    return { x: spread * at, z: -depth * at, turn: tilt * Math.min(at, 1) };
  };

  // The projected right edge, sampled along the way: tilt and depth pull
  // against each other, so the widest point is not always the deepest card.
  let reach = HALF;
  for (let d = 0; d <= deepest; d += 0.05) {
    const { x, z, turn } = place(d);
    const rad = (turn * Math.PI) / 180;
    const edgeX = x + HALF * Math.cos(rad);
    const edgeZ = z - HALF * Math.sin(rad);
    reach = Math.max(reach, (edgeX * PERSPECTIVE) / (PERSPECTIVE - edgeZ));
  }
  // A hair over, so rounding never puts the edge a pixel outside.
  const room = 1 - (2 * HALF) / (HALF + reach * 1.01);

  return { place, deepest, room: Math.max(0, room) };
}

// The column the stack sits in: the screen less its gutters, up to the wide
// measure ($measure-wide). On a phone that is 100vw less both gutters, at
// $inline-pad of 4vw each.
const PHONE_VW = 92;
const MEASURE_REM = 61.25;
// Each gutter above a phone: 2rem ($inline-pad-max), 4vw reaches it at 800px.
const GUTTERS_REM = 4;
// With a table of contents the rail takes the margin from 68rem (TableOfContents
// $rail-from): both gutters (2rem each) and the narrowest rail with its gap
// (10rem + 1.5rem) on each side leave 100vw less this.
const RAIL_FROM = '(min-width: 68rem)';
const RAIL_REM = 27;

// A fraction of the column 100vw less `less` rem wide, capped at the measure.
const column = (less, fraction) =>
  `min(${Math.ceil(MEASURE_REM * fraction * 10) / 10}rem, (100vw - ${less}rem) * ${Math.ceil(fraction * 1000) / 1000})`;

// `sizes` for the front card, its share of the column; under reduced motion
// it takes the whole row. `besideRail`: the carousel sits beside a table of
// contents, whose rail narrows the column on wide screens.
export function carouselSizes(count, loop, besideRail = false) {
  const share = 1 - depthOf(count, loop && count > 1).room;
  const still = '(prefers-reduced-motion: reduce)';
  const railed = (prefix, fraction) =>
    besideRail && `${prefix}${RAIL_FROM} ${column(RAIL_REM, fraction)}`;
  return [
    `${still} and ${PHONE} ${PHONE_VW}vw`,
    railed(`${still} and `, 1),
    `${still} ${column(GUTTERS_REM, 1)}`,
    `${PHONE} ${Math.ceil(PHONE_VW * share)}vw`,
    railed('', share),
    column(GUTTERS_REM, share)
  ]
    .filter(Boolean)
    .join(', ');
}

import {
  LuArrowUpRight,
  LuAward,
  LuCake,
  LuCandyCane,
  LuConstruction,
  LuCrown,
  LuFlower2,
  LuGhost,
  LuGift,
  LuHeart,
  LuInfinity,
  LuLeaf,
  LuMedal,
  LuPartyPopper,
  LuSnowflake,
  LuStar,
  LuSun,
  LuTreePine,
  LuTriangleAlert,
  LuTrophy,
  LuWorm,
  LuWrench
} from 'react-icons/lu';
import styles from '@/styles/components/Announcement.module.scss';

// Lucide ships no curls: one-path lines on Lucide's stroke conventions, 24 high
// and as wide as the curl needs, rendered 1em high.
const TAU = Math.PI * 2;
const r2 = (n) => Math.round(n * 100) / 100;

// Sampled points to a smooth path (Catmull-Rom as cubics), fitted into the box.
const toPath = (pts, w, pad = 2.5) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys)
  ];
  const k = Math.min((w - pad * 2) / (x1 - x0), (24 - pad * 2) / (y1 - y0));
  const q = pts.map(([x, y]) => [
    w / 2 + (x - (x0 + x1) / 2) * k,
    12 + (y - (y0 + y1) / 2) * k
  ]);
  const f = ([x, y]) => `${r2(x)} ${r2(y)}`;
  let d = `M${f(q[0])}`;
  for (let i = 0; i < q.length - 1; i++) {
    const [p0, p1, p2, p3] = [
      q[i - 1] ?? q[i],
      q[i],
      q[i + 1],
      q[i + 2] ?? q[i + 1]
    ];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1)} ${f(c2)} ${f(p2)}`;
  }
  return d;
};

// A rolling-circle line: loops where the radius b(t) beats the roll a, humps
// where it doesn't. Starts and ends on the midline.
const roll = (periods, a, b) =>
  Array.from({ length: periods * 24 + 1 }, (_, i) => {
    const t = Math.PI / 2 + (i / 24) * TAU;
    return [a * t - b(t) * Math.sin(t), -b(t) * Math.cos(t)];
  });

const smoothstep = (e0, e1, x) => {
  const p = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return p * p * (3 - 2 * p);
};

const spiral = () => {
  const pts = Array.from({ length: 43 }, (_, i) => {
    const th = 0.5 + (i / 42) * 1.75 * TAU;
    return [th * Math.cos(th), th * Math.sin(th)];
  });
  // a short tail along the last tangent
  const [x, y] = pts.at(-1);
  const [px, py] = pts.at(-2);
  const len = Math.hypot(x - px, y - py);
  pts.push([x + ((x - px) / len) * 3.5, y + ((y - py) / len) * 3.5]);
  return pts;
};

const drawn = (w, pts) => {
  const d = toPath(pts, w);
  const style = { width: `${w / 24}em` };
  return function Drawn({ className, strokeWidth }) {
    return (
      <svg
        className={className}
        style={style}
        viewBox={`0 0 ${w} 24`}
        fill='none'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'>
        <path d={d} />
      </svg>
    );
  };
};

// A character in the band's face, the CMS logo, a line icon, or nothing.
export const GLYPHS = {
  none: null,
  dot: '·',
  slash: '/',
  doubleSlash: '//',
  rule: '–',
  wave: '~',
  logo: 'logo',
  arrow: LuArrowUpRight,
  snowflake: LuSnowflake,
  sun: LuSun,
  leaf: LuLeaf,
  flower: LuFlower2,
  tree: LuTreePine,
  ghost: LuGhost,
  candyCane: LuCandyCane,
  partyPopper: LuPartyPopper,
  gift: LuGift,
  cake: LuCake,
  heart: LuHeart,
  star: LuStar,
  trophy: LuTrophy,
  medal: LuMedal,
  award: LuAward,
  crown: LuCrown,
  worm: LuWorm,
  barrier: LuConstruction,
  wrench: LuWrench,
  warning: LuTriangleAlert,
  infinity: LuInfinity,
  spiral: drawn(24, spiral()),
  curl: drawn(
    42,
    roll(2.5, 1, (t) => 3.4 - 2 * smoothstep(TAU, TAU + Math.PI, t))
  )
};

export default function AnnouncementSeparator({ name, logo }) {
  // unset or unknown is the dot
  const key = Object.hasOwn(GLYPHS, name) ? name : 'dot';
  const glyph = GLYPHS[key];
  if (!glyph) return null;
  if (glyph === 'logo')
    return (
      <span
        className={styles.glyph}
        dangerouslySetInnerHTML={{ __html: logo }}
      />
    );
  if (typeof glyph === 'string')
    return (
      <span className={styles.char} data-char={key}>
        {glyph}
      </span>
    );
  const Icon = glyph;
  return (
    <Icon className={styles.glyph} strokeWidth={2.25} aria-hidden='true' />
  );
}

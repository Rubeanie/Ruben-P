import { stegaClean } from '@sanity/client/stega';

// Chip and URL value for a category: lowercase words joined by hyphens.
export function categorySlug(title) {
  return String(title ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Title order, the tail order for categories the site list leaves out.
export function byCategory(a, b) {
  const title = (c) => stegaClean(c?.title) ?? '';
  return title(a).localeCompare(title(b), 'en');
}

// The site's category order first, anything unlisted after it by title.
export function orderCategories(categories, order) {
  const rank = new Map(order.map((c, i) => [c?._id, i]));
  return [...categories].sort(
    (a, b) =>
      (rank.get(a?._id) ?? Infinity) - (rank.get(b?._id) ?? Infinity) ||
      byCategory(a, b)
  );
}

// The index is pure date order, so the rows that want featured posts first lift them here; the sort is stable, so each group keeps its dates.
export function featuredFirst(posts) {
  return [...posts].sort((a, b) => Boolean(b.featured) - Boolean(a.featured));
}

// Posts that share the most categories with `current` come first, newest breaking ties;
// a post with no categories falls back to featured, then newest.
export function relatedPosts(posts, current, limit) {
  const others = posts.filter((post) => post._id !== current?._id);
  const mine = new Set((current?.categories ?? []).map((c) => c._id));
  if (!mine.size) return featuredFirst(others).slice(0, limit);
  const shared = (post) =>
    (post.categories ?? []).filter((c) => mine.has(c._id)).length;
  return others
    .map((post) => ({ post, n: shared(post) }))
    .sort(
      (a, b) =>
        b.n - a.n ||
        String(b.post.publishDate).localeCompare(String(a.post.publishDate))
    )
    .slice(0, limit)
    .map(({ post }) => post);
}

// WCAG relative luminance of a hex colour.
function luminance(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Contrast-ratio terms (luminance + 0.05) of the two ink tokens in _variables.scss:
// $color-on-primary (#121212) for the dark ink, $color-on-dark (#fff) for the light ink.
const DARK_INK = 0.0556;
const LIGHT_INK = 1.05;

// Which of the two ink tokens contrasts more with a category colour.
export function inkFor(hex) {
  if (!/^#[0-9a-f]{6}/i.test(hex ?? '')) return 'light';
  const l = luminance(hex);
  return (l + 0.05) / DARK_INK >= LIGHT_INK / (l + 0.05) ? 'dark' : 'light';
}

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

// Publish dates are calendar days, read in UTC so the server and the browser agree on the day.
// Spelled out rather than through Intl: ICU builds abbreviate September as 'Sep' or 'Sept'
// depending on the runtime, and a server/browser disagreement broke hydration on iOS.
export function formatDate(iso) {
  const date = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// iPadOS reports itself as a Mac with touch points.
export function iosWebKit() {
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// One place asks the OS, so every script animation and the morph agree on when to stand down.
export function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// The standard curve lives in the stylesheet; script animations read it instead of repeating the bezier.
export function easeOut(el) {
  return (
    getComputedStyle(el).getPropertyValue('--ease-out').trim() ||
    'cubic-bezier(0, 0, 0.58, 1)'
  );
}

// The letters on an avatar without a photo: the first of each of the first two words.
export function initials(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

// Whether two ISO timestamps fall on the same calendar day.
export function sameDay(a, b) {
  return String(a).slice(0, 10) === String(b).slice(0, 10);
}

import { stegaClean } from '@sanity/client/stega';

// The Studio's separator options; the band's glyph table is keyed by the same values.
export const SEPARATORS = [
  { title: 'None', value: 'none' },
  { title: 'Dot', value: 'dot' },
  { title: 'Slash', value: 'slash' },
  { title: 'Double slash', value: 'doubleSlash' },
  { title: 'Rule', value: 'rule' },
  { title: 'Wave', value: 'wave' },
  { title: 'Logo', value: 'logo' },
  { title: 'Arrow', value: 'arrow' },
  { title: 'Snowflake', value: 'snowflake' },
  { title: 'Sun', value: 'sun' },
  { title: 'Leaf', value: 'leaf' },
  { title: 'Flower', value: 'flower' },
  { title: 'Tree', value: 'tree' },
  { title: 'Ghost', value: 'ghost' },
  { title: 'Candy cane', value: 'candyCane' },
  { title: 'Party popper', value: 'partyPopper' },
  { title: 'Gift', value: 'gift' },
  { title: 'Cake', value: 'cake' },
  { title: 'Heart', value: 'heart' },
  { title: 'Star', value: 'star' },
  { title: 'Trophy', value: 'trophy' },
  { title: 'Medal', value: 'medal' },
  { title: 'Award', value: 'award' },
  { title: 'Crown', value: 'crown' },
  { title: 'Worm', value: 'worm' },
  { title: 'Barrier', value: 'barrier' },
  { title: 'Wrench', value: 'wrench' },
  { title: 'Warning', value: 'warning' },
  { title: 'Infinity', value: 'infinity' },
  { title: 'Spiral', value: 'spiral' },
  { title: 'Curl', value: 'curl' }
];

const time = (value) => Date.parse(stegaClean(value));

// Where a dismissal is stored, read by the inline gate and the band alike.
export const dismissKey = (id) => `announcement-dismissed:${id}`;

// A dismissal lasts a few days, then the band comes back. It stores when it was
// dismissed; anything older, or unreadable, has lapsed.
export const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

// Dismissed within `ms` (here or in another tab), or past its end. The band
// and its inline gate both run it; the gate by its source text, so it stays
// self-contained and in syntax every browser parses as is: no imports, no
// optional chaining, and DISMISS_MS comes in as `ms`.
export function isHidden(key, end, ms) {
  const now = Date.now();
  if (end && now >= end) return true;
  try {
    return now - Number(localStorage.getItem(key)) < ms;
  } catch {
    return false;
  }
}

// Runs before the band paints: a recently dismissed or expired band is hidden
// with no flash. The attribute holds the id, so the band can clear it for a
// different announcement.
function gate(hidden, id, key, end, ms) {
  if (hidden(key, end, ms))
    document.documentElement.setAttribute('data-announcement-hidden', id);
}

const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
export const announcementGate = (id, end) =>
  `(${gate})(${isHidden},${json(id)},${json(dismissKey(id))},${end},${DISMISS_MS})`;

// Picked at render, so a start passing waits for a publish; the inline gate covers `end`.
// The first announcement whose schedule contains now; either bound is optional.
export function liveAnnouncement(announcements, now = Date.now()) {
  return (
    announcements?.find(({ start, end }) => {
      const from = time(start);
      const until = time(end);
      return !(from > now) && !(until <= now);
    }) ?? null
  );
}

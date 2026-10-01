import { stegaClean } from '@sanity/client/stega';

// The Studio's separator options; the band's glyph table is keyed by the same values.
export const SEPARATORS = [
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

import { expect, spyOn, test } from 'bun:test';
import {
  DISMISS_MS,
  announcementGate,
  dismissKey,
  isHidden,
  liveAnnouncement
} from './announcement';
import { GLYPHS } from '../components/AnnouncementSeparator';
import { announcement } from '@/sanity/schemaTypes/documents/announcement';

const now = Date.parse('2026-10-01T12:00:00Z');
const before = '2026-09-30T12:00:00Z';
const after = '2026-10-02T12:00:00Z';
const pick = (list) => liveAnnouncement(list, now)?._id ?? null;

test('an open schedule is always live', () => {
  expect(pick([{ _id: 'a' }])).toBe('a');
});

test('start only: live once it has passed', () => {
  expect(pick([{ _id: 'a', start: before }])).toBe('a');
  expect(pick([{ _id: 'a', start: after }])).toBe(null);
});

test('end only: live until it passes', () => {
  expect(pick([{ _id: 'a', end: after }])).toBe('a');
  expect(pick([{ _id: 'a', end: before }])).toBe(null);
});

test('both bounds: live only between them', () => {
  expect(pick([{ _id: 'a', start: before, end: after }])).toBe('a');
  expect(pick([{ _id: 'a', start: after, end: after }])).toBe(null);
  expect(pick([{ _id: 'a', start: before, end: before }])).toBe(null);
});

test('null bounds are open', () => {
  expect(pick([{ _id: 'a', start: null, end: null }])).toBe('a');
});

test('each announcement has its own dismiss key', () => {
  expect(dismissKey('a')).not.toBe(dismissKey('b'));
});

test('the first live one wins, in list order', () => {
  const list = [
    { _id: 'expired', end: before },
    { _id: 'later', start: after },
    { _id: 'first', start: before },
    { _id: 'second' }
  ];
  expect(pick(list)).toBe('first');
});

test('no announcements, none live', () => {
  expect(pick(undefined)).toBe(null);
  expect(pick([])).toBe(null);
});

test('every separator the Studio offers has a glyph', () => {
  const field = announcement.fields.find((f) => f.name === 'separator');
  const values = field.options.list.map((option) => option.value);
  expect(values.length).toBeGreaterThan(0);
  for (const value of values) expect(GLYPHS[value]).toBeDefined();
  expect(values).toContain(field.initialValue);
});

// [what, end, stored, hidden] at `now`; a stored Error throws, as blocked
// storage does. The band and its inline gate must agree on every one.
const cases = [
  ['a recent dismissal hides it', 0, String(now - 1000), true],
  ['a dismissal lapses after a few days', 0, String(now - DISMISS_MS), false],
  // The old flag ('1') and missing or junk values count as lapsed.
  ['the old flag has lapsed', 0, '1', false],
  ['no dismissal shows it', 0, null, false],
  ['a junk dismissal shows it', 0, 'x', false],
  ['its end hides it', now, null, true],
  ['before its end it shows', now + 1, null, false],
  ['its end hides it with storage blocked', now, new Error('blocked'), true],
  ['blocked storage shows it', 0, new Error('blocked'), false]
];

// The visitor's storage, holding `stored` under the band's key.
const storage = (id, stored) => ({
  getItem: (key) => {
    if (stored instanceof Error) throw stored;
    return key === dismissKey(id) ? stored : null;
  }
});

// The band's check, as AnnouncementBand runs it.
function bandHides(end, stored) {
  const clock = spyOn(Date, 'now').mockReturnValue(now);
  globalThis.localStorage = storage('a', stored);
  try {
    return isHidden(dismissKey('a'), end, DISMISS_MS);
  } finally {
    clock.mockRestore();
    delete globalThis.localStorage;
  }
}

// Runs the inline gate. Returns the flag it leaves on <html>.
function gated(id, end, stored) {
  let flag = null;
  const env = {
    Date: { now: () => now },
    localStorage: storage(id, stored),
    document: {
      documentElement: {
        setAttribute: (name, value) =>
          name === 'data-announcement-hidden' && (flag = value)
      }
    }
  };
  new Function(...Object.keys(env), announcementGate(id, end))(
    ...Object.values(env)
  );
  return flag;
}

for (const [what, end, stored, hidden] of cases)
  test(`band and gate: ${what}`, () => {
    expect(bandHides(end, stored)).toBe(hidden);
    expect(gated('a', end, stored)).toBe(hidden ? 'a' : null);
  });

test('the gate escapes markup in the id', () => {
  const id = 'a</script><script>alert(1)</script>';
  expect(announcementGate(id, 0)).not.toContain('</script>');
  expect(gated(id, now, null)).toBe(id);
});

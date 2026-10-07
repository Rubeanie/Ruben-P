import { expect, test } from 'bun:test';
import {
  DISMISS_MS,
  dismissKey,
  isDismissed,
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

test('a dismissal lapses after a few days', () => {
  const now = 1_000_000_000_000;
  expect(isDismissed(String(now - 1000), now)).toBe(true);
  expect(isDismissed(String(now - DISMISS_MS), now)).toBe(false);
  // The old flag ('1') and missing or junk values count as lapsed.
  expect(isDismissed('1', now)).toBe(false);
  expect(isDismissed(null, now)).toBe(false);
  expect(isDismissed('x', now)).toBe(false);
});

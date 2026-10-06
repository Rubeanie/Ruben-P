import { expect, test } from 'bun:test';
import { aimFor, behind, stepFrom } from './loop';

test('stepping stops at the ends unless the row loops', () => {
  expect(stepFrom(0, -1, 4, false)).toBeNull();
  expect(stepFrom(3, 1, 4, false)).toBeNull();
  expect(stepFrom(1, 1, 4, false)).toBe(2);
  expect(stepFrom(0, -1, 4, true)).toBe(3);
  expect(stepFrom(3, 1, 4, true)).toBe(0);
});

test('a loop keeps one card passed and the rest behind', () => {
  expect([0, 1, 2, 3].map((i) => behind(i, 0, 4, true))).toEqual([0, 1, 2, -1]);
  expect([0, 1, 2, 3].map((i) => behind(i, 3, 4, true))).toEqual([1, 2, -1, 0]);
  expect(behind(0, 2, 4, false)).toBe(-2);
});

test('aiming takes the short way round, forwards on a tie', () => {
  // From the last card to the first is one step on, not five back.
  expect(aimFor(5, 0, 6, true)).toBe(6);
  expect(aimFor(6, 5, 6, true)).toBe(5);
  expect(aimFor(0, 3, 6, true)).toBe(3);
  expect(aimFor(0, 2, 4, true)).toBe(2);
  expect(aimFor(4, 1, 6, false)).toBe(1);
});

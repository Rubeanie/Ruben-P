import { expect, test } from 'bun:test';
import { blurFilter, ease, track, turnAt } from './hero3d';

const keys = [
  [0, 0],
  [0.2, 1],
  [0.5, 1],
  [1, 3]
];

test('track passes through its keys exactly', () => {
  const at = track(keys);
  for (const [t, v] of keys) expect(at(t)).toBe(v);
});

test('track holds a repeated value flat between two equal keys', () => {
  const at = track(keys);
  for (let i = 1; i < 50; i++) {
    expect(at(0.2 + (0.3 * i) / 50)).toBeCloseTo(1, 12);
  }
});

test('track never falls back between two increasing keys', () => {
  const at = track(keys);
  let last = at(0.5);
  for (let i = 1; i <= 50; i++) {
    const v = at(0.5 + (0.5 * i) / 50);
    expect(v).toBeGreaterThanOrEqual(last);
    last = v;
  }
});

test('ease runs from 0 through the middle to 1', () => {
  expect(ease(0)).toBeCloseTo(0, 12);
  expect(ease(0.5)).toBeCloseTo(0.5, 12);
  expect(ease(1)).toBeCloseTo(1, 12);
});

test('turnAt lands on the face by p 0.5 and stays there', () => {
  expect(turnAt(0)).toBe(0);
  expect(turnAt(0.5)).toBeCloseTo(1, 12);
  expect(turnAt(0.8)).toBeCloseTo(1, 12);
});

test('blurFilter never writes blur(0px)', () => {
  expect(blurFilter(0)).toBe('');
  expect(blurFilter(0.049)).toBe('');
  expect(blurFilter(0.05)).toBe('blur(0.1px)');
  expect(blurFilter(4)).toBe('blur(4.0px)');
});

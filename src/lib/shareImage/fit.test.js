import { expect, test } from 'bun:test';
import { baseline, fitTags, fitTitle } from './fit';

// Every character half an em wide.
const measure = (text) => [...text].length * 0.5;

test('a title keeps the largest size and shrinks only when long', () => {
  const opts = { width: 740, max: 64, min: 36 };
  expect(fitTitle(measure, 'Short', opts)).toEqual({
    size: 64,
    lines: ['Short']
  });
  // 46 chars at 64 px run past 740 in one line but wrap into two, still at 64
  const two = fitTitle(
    measure,
    'Twenty two characters. Twenty two characters.',
    opts
  );
  expect(two.size).toBe(64);
  expect(two.lines).toEqual([
    'Twenty two characters.',
    'Twenty two characters.'
  ]);
  const long = fitTitle(measure, 'word '.repeat(14).trim(), opts);
  expect(long.size).toBeLessThan(64);
  expect(long.lines).toHaveLength(2);
});

test('a title too long at the smallest size keeps two lines and cuts the second', () => {
  const t = fitTitle(measure, 'word '.repeat(60), {
    width: 740,
    max: 64,
    min: 36
  });
  expect(t.size).toBe(36);
  expect(t.lines).toHaveLength(2);
  expect(t.lines[0].endsWith('…')).toBe(false);
  expect(t.lines[1].endsWith('…')).toBe(true);
  expect(t.lines[1]).not.toMatch(/ …$/);
});

const widths = {
  tagWidth: (t) => t.length * 10,
  plusWidth: (n) => `+${n}`.length * 10,
  gap: 10
};

test('tags that fit all show', () => {
  expect(fitTags(['one', 'two'], 200, widths)).toEqual({
    shown: ['one', 'two'],
    more: 0
  });
});

test('the overflow folds into +N, with room kept for it', () => {
  // 50 + 10 + 50 would fit, but not with the +2 capsule after it
  expect(fitTags(['aaaaa', 'bbbbb', 'ccccc', 'ddddd'], 130, widths)).toEqual({
    shown: ['aaaaa'],
    more: 3
  });
});

test('a single tag too long for the line is cut', () => {
  const { shown, more } = fitTags(['a very long category name'], 100, widths);
  expect(more).toBe(0);
  expect(shown[0].endsWith('…')).toBe(true);
  expect(widths.tagWidth(shown[0])).toBeLessThanOrEqual(100);
});

test('the baseline sits where Satori draws it: content area centred in the line', () => {
  // Mont's hhea: 0.75 up, 0.25 down; at 64 px on a 1.1 line, 3.2 px of half-leading
  const mont = { ascender: 0.75, descender: -0.25 };
  expect(baseline(mont, 64, 1.1)).toBeCloseTo(51.2);
  expect(baseline(mont, 200, 1)).toBeCloseTo(150);
});

test('an empty or blank title fits as no lines instead of failing', () => {
  const opts = { width: 740, max: 64, min: 36 };
  expect(fitTitle(measure, '   ', opts)).toEqual({ size: 64, lines: [] });
  expect(fitTitle(measure, '', opts).lines).toEqual([]);
  expect(fitTitle(measure, undefined, opts).lines).toEqual([]);
});

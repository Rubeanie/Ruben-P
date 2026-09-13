import { expect, test } from 'bun:test';
import { formatStat, parseStat } from './countUp';

test('parseStat reads a bare integer', () => {
  const parsed = parseStat('40');
  expect(parsed).toEqual({
    prefix: '',
    number: 40,
    suffix: '',
    decimals: 0,
    grouping: false
  });
  expect(formatStat(40, parsed)).toBe('40');
});

test('parseStat keeps the decimal places the editor typed', () => {
  const parsed = parseStat('4.5');
  expect(parsed.decimals).toBe(1);
  expect(formatStat(2.25, parsed)).toBe('2.3');
});

test('parseStat keeps grouping when the source was grouped', () => {
  const parsed = parseStat('1,200');
  expect(parsed.number).toBe(1200);
  expect(formatStat(1200, parsed)).toBe('1,200');
  expect(formatStat(1200, parseStat('1200'))).toBe('1200');
});

test('parseStat keeps a prefix and a suffix around the number', () => {
  const parsed = parseStat('$12k');
  expect(parsed.prefix).toBe('$');
  expect(parsed.suffix).toBe('k');
  expect(formatStat(7, parsed)).toBe('$7k');
});

test('parseStat does not swallow a trailing comma into the number', () => {
  const parsed = parseStat('12, approximately');
  expect(parsed.number).toBe(12);
  expect(parsed.suffix).toBe(', approximately');
});

test('parseStat returns null when there is nothing to count', () => {
  expect(parseStat('🐐')).toBe(null);
  expect(parseStat('')).toBe(null);
  expect(parseStat('∞')).toBe(null);
  expect(parseStat(undefined)).toBe(null);
});

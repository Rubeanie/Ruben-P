import { expect, test } from 'bun:test';
import { isSafeHref } from './processUrl';

test('isSafeHref allows app schemes and relative paths, blocks executable ones', () => {
  expect(isSafeHref('modrinth://mod/sodium')).toBe(true);
  expect(isSafeHref('steam://openurl/https://x')).toBe(true);
  expect(isSafeHref('mailto:a@b.c')).toBe(true);
  expect(isSafeHref('/contact')).toBe(true);
  expect(isSafeHref('#top')).toBe(true);
  expect(isSafeHref('javascript:alert(1)')).toBe(false);
  expect(isSafeHref('java\nscript:alert(1)')).toBe(false);
  expect(isSafeHref('JavaScript:alert(1)')).toBe(false);
  expect(isSafeHref('data:text/html,x')).toBe(false);
  expect(isSafeHref('http://[')).toBe(false);
});

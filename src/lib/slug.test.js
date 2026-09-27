import { expect, test } from 'bun:test';
import { isPagePath } from './slug';

test.each([
  ['/', true],
  ['/about', true],
  ['/work/brand', true],
  ['/test-for-sahil-', true],
  ['/café', true],
  ['/index', true],
  ['/a?b', false],
  ['/a#b', false],
  ['/a/../b', false],
  ['/./a', false],
  ['/\\evil', false],
  ['/a b', false],
  ['404', false],
  ['redirect', false],
  ['about', false],
  ['/about/', false],
  ['//x', false],
  ['/a//b', false],
  ['index', false],
  ['', false]
])('isPagePath(%p) is %p', (slug, expected) => {
  expect(isPagePath(slug)).toBe(expected);
});

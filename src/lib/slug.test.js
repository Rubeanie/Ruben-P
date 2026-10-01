import { expect, test } from 'bun:test';
import { isIndexable, isPagePath } from './slug';

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

test('isIndexable: a page follows the site unless it sets its own', () => {
  expect(isIndexable({ slug: '/a' }, {})).toBe(true);
  expect(isIndexable({ slug: '/a' }, { noindex: true })).toBe(false);
  expect(isIndexable({ slug: '/a', noindex: false }, { noindex: true })).toBe(
    true
  );
  expect(isIndexable({ slug: '/a', noindex: true }, { noindex: false })).toBe(
    false
  );
  expect(isIndexable({ slug: '404' }, null)).toBe(false);
});

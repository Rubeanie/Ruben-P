import { expect, test } from 'bun:test';
import { ancestorPaths, pagePath } from './breadcrumbs';

test('pagePath returns the slug when it is a page path', () => {
  expect(pagePath({ metadata: { slug: '/' } })).toBe('/');
  expect(pagePath({ metadata: { slug: '/portfolio/x' } })).toBe('/portfolio/x');
});

test('pagePath returns null for templates and malformed slugs', () => {
  expect(pagePath({ metadata: { slug: '404' } })).toBe(null);
  expect(pagePath({ metadata: { slug: 'index' } })).toBe(null);
  expect(pagePath({ metadata: { slug: 'portfolio/x' } })).toBe(null);
  expect(pagePath({ metadata: { slug: '/about/' } })).toBe(null);
});

test('pagePath returns null when there is no slug', () => {
  expect(pagePath({})).toBe(null);
  expect(pagePath(undefined)).toBe(null);
  expect(pagePath({ metadata: { slug: '' } })).toBe(null);
});

test('pagePath strips stega markers from the slug', () => {
  const marked =
    '/about\u200b\u200b\u200b\u200b\u200c\ufeff\u200d\ufeff\u200b\u200d\u200b\u200d\u200c\u200d\ufeff\ufeff\u200c\ufeff\u200b\u200d\u200c\u200d\u200d\u200c\u200c\u200d\u200c\ufeff\u200c\u200d\u200d\u200c\u200c\u200d\ufeff\u200d\u200b\u200d\u200b\u200d\u200b\ufeff\u200d\u200d\u200b\u200d\u200b\u200d\u200c\ufeff\u200b\ufeff\u200c\u200d\u200b\u200c\u200c\u200d\ufeff\u200d\u200c\u200d\u200d\u200c\u200c\ufeff\u200c\u200b\u200c\ufeff\u200d\u200c\u200b\u200d\ufeff\u200d\u200c\u200d\u200d\u200c\u200c\u200d\ufeff\ufeff\u200b\u200d\u200b\u200d\u200b\u200d\ufeff\u200b\u200b\u200d\u200b\u200d\u200c\u200d\u200d\u200b\u200c\ufeff\u200b\u200d\u200c\u200d\u200c\u200c\u200c\u200d\u200c\u200d\u200b\u200d\u200b\u200d\u200b\ufeff\u200d\u200d\u200b\u200d\u200b\u200d\u200b\u200d\ufeff\ufeff\u200c\u200d\u200b\u200c\u200c\u200d\u200b\u200d\u200c\u200d\ufeff\ufeff\u200c\ufeff\u200c\u200c\u200c\ufeff\u200c\u200b\u200b\u200d\u200b\u200d\u200c\ufeff\ufeff\u200c';
  expect(pagePath({ metadata: { slug: marked } })).toBe('/about');
});

test('ancestorPaths lists every layer above the page', () => {
  expect(ancestorPaths('/a/b/c')).toEqual(['/a', '/a/b']);
  expect(ancestorPaths('/a')).toEqual([]);
  expect(ancestorPaths('/portfolio/web/site')).toEqual([
    '/portfolio',
    '/portfolio/web'
  ]);
});

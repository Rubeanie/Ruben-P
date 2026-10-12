import { expect, test } from 'bun:test';
import { baseUrl } from '@/lib/env';
import processUrl, { isSafeHref, resolveLink } from './processUrl';

test('processUrl resolves the home page slug to /', () => {
  expect(
    processUrl({ metadata: { slug: { current: '/' } } }, { base: false })
  ).toBe('/');
});

test('processUrl resolves a normal slug to /<slug>', () => {
  expect(
    processUrl({ metadata: { slug: { current: '/about' } } }, { base: false })
  ).toBe('/about');
});

test('processUrl falls back to the base URL for a missing slug', () => {
  expect(processUrl({})).toBe(`${baseUrl}/`);
});

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

test('resolveLink tolerates a missing link', () => {
  expect(resolveLink(null)).toBe(null);
  expect(resolveLink(undefined)).toBe(null);
});

test('resolveLink returns null for a malformed internal slug', () => {
  expect(
    resolveLink({
      type: 'internal',
      internal: { metadata: { slug: { current: 'about' } } }
    })
  ).toBe(null);
});

test('resolveLink resolves an internal home page slug to /', () => {
  expect(
    resolveLink({
      type: 'internal',
      internal: { metadata: { slug: { current: '/' } } }
    })
  ).toBe('/');
});

test('resolveLink returns null for an internal template slug', () => {
  expect(
    resolveLink({
      type: 'internal',
      internal: { metadata: { slug: { current: '404' } } }
    })
  ).toBe(null);
});

test.each([
  ['/about', '#team', '/about#team'],
  ['/about', '?x=1', '/about?x=1'],
  ['/', '#top', '/#top'],
  ['/', '/evil.example.com', '/'],
  ['/about', 'sub', '/about']
])('resolveLink(%p + %p) is %p', (slug, params, expected) => {
  expect(
    resolveLink({
      type: 'internal',
      params,
      internal: { metadata: { slug: { current: slug } } }
    })
  ).toBe(expected);
});

test('resolveLink appends only a query or fragment to an external link', () => {
  expect(
    resolveLink({ type: 'external', external: 'https://x.dev', params: '#a' })
  ).toBe('https://x.dev#a');
  expect(
    resolveLink({ type: 'external', external: 'https://x.dev', params: 'b' })
  ).toBe('https://x.dev');
});

import { expect, test } from 'bun:test';
import { matchRedirect } from './redirects';

test('exact source matches', () => {
  const r = { source: '/old-path', destination: '/new-path' };
  expect(matchRedirect(r, '/old-path')).toBe('/new-path');
  expect(matchRedirect(r, '/other')).toBe(null);
  expect(matchRedirect(r, '/old-path/deeper')).toBe(null);
});

test(':param segments carry into the destination', () => {
  const r = { source: '/old-blog/:slug', destination: '/portfolio/:slug' };
  expect(matchRedirect(r, '/old-blog/hello')).toBe('/portfolio/hello');
  expect(matchRedirect(r, '/old-blog')).toBe(null);
  expect(matchRedirect(r, '/old-blog/a?b')).toBe('/portfolio/a%3Fb');
});

test('external destinations pass, unsafe schemes are blocked', () => {
  expect(
    matchRedirect(
      { source: '/socials/linkedin', destination: 'https://linkedin.com/in/x' },
      '/socials/linkedin'
    )
  ).toBe('https://linkedin.com/in/x');
  expect(
    matchRedirect({ source: '/x', destination: 'javascript:alert(1)' }, '/x')
  ).toBe(null);
});

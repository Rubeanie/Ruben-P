import { expect, test } from 'bun:test';
import { firstModule, isQuietHtml } from './modules';

test.each([
  ['', true],
  [' \n ', true],
  ['<script>go()</script>', true],
  ['<SCRIPT src="x"></SCRIPT >', true],
  ['<style>a{}</style><link rel="preload" href="/x"><meta name="a">', true],
  ['<!-- note --><noscript><p>No JS</p></noscript>', true],
  ['<meta content="a>b">', true],
  ['\u00a0', false],
  ['Just text', false],
  ['<style>a{}</style><p>Copy</p>', false],
  ['<p>Copy</p><script>go()</script>', false],
  ['<div></div>', false]
])('isQuietHtml(%p) is %p', (code, quiet) => {
  expect(isQuietHtml(code)).toBe(quiet);
});

test('firstModule skips embeds that draw nothing', () => {
  const quiet = { _type: 'custom-html', html: { code: '<script></script>' } };
  const hero = { _type: 'hero' };
  expect(firstModule([quiet, hero])).toBe(hero);
  expect(
    firstModule([{ _type: 'custom-html', html: { code: 'Hi' } }, hero])._type
  ).toBe('custom-html');
  expect(firstModule(undefined)).toBeUndefined();
});

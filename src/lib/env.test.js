import { expect, test } from 'bun:test';
import { resolveBaseUrl } from './env';

test.each([
  [
    { site: 'https://www.alpha.ruben-p.com', production: 'www.ruben-p.com' },
    'https://www.alpha.ruben-p.com'
  ],
  [
    { site: 'https://www.ruben-p.com/', production: null },
    'https://www.ruben-p.com'
  ],
  [{ site: null, production: 'www.ruben-p.com' }, 'https://www.ruben-p.com'],
  [{ site: null, production: null }, 'http://localhost:3000'],
  [{ site: '', production: '' }, 'http://localhost:3000']
])('resolveBaseUrl(%p) is %p', (env, expected) => {
  expect(resolveBaseUrl(env)).toBe(expected);
});

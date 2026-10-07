import { expect, test } from 'bun:test';
import { folderFor } from './cloudinaryFolder';
import { createSignHandler, signParams } from './cloudinarySign';
import { RATE_LIMIT } from './studioReview';

const MEMBER = 'member-token';
const SECRET = 'fake-secret-for-tests';
const ENV = { CLOUDINARY_API_KEY: '1234', CLOUDINARY_API_SECRET: SECRET };
const NOW = 1_800_000_000_000;
const PAGES = ['/', '/about'];

// Sanity knows one member; anything else is a stranger or no session at all.
function fakeFetch() {
  const calls = [];
  const fetcher = async (url, init) => {
    const auth = init.headers.Authorization;
    calls.push(auth);
    if (auth === `Bearer ${MEMBER}`)
      return Response.json({ id: 'u1', roles: [{ name: 'editor' }] });
    if (auth === 'Bearer odd-roles')
      return Response.json({ id: 'u2', roles: { name: 'editor' } });
    return Response.json({ statusCode: 401 }, { status: 401 });
  };
  return { fetcher, calls };
}

const handler = ({ env = ENV, fetcher = fakeFetch().fetcher } = {}) =>
  createSignHandler({
    fetch: fetcher,
    env,
    now: () => NOW,
    exists: async (path) => PAGES.includes(path),
    random: () => 'abc123'
  });

const post = (body, token = MEMBER, ip = '203.0.113.1') =>
  new Request('http://localhost/api/studio/cloudinary-sign', {
    method: 'POST',
    headers: {
      'x-forwarded-for': ip,
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });

test("the signature matches Cloudinary's documented example", () => {
  expect(
    signParams(
      {
        timestamp: 1315060510,
        public_id: 'sample_image',
        eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop'
      },
      'abcd'
    )
  ).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e');
});

test('a page path maps to a plain folder under Website/Pages', () => {
  const cases = {
    '/': 'home',
    '/about': 'about',
    '/portfolio/omg-thing': 'portfolio/omg-thing',
    '/About_Me': 'about-me',
    '/café--au lait': 'caf-au-lait',
    '/v2': 'page-v2',
    '/v2-launch': 'page-v2-launch',
    '/vinyl': 'vinyl',
    '/日本': null,
    '/..': null,
    '/a/../b': null,
    '/a//b': null,
    '/about/': null,
    about: null,
    '': null,
    '/a/b/c/d/e': null,
    [`/${'a'.repeat(200)}`]: null
  };
  for (const [path, folder] of Object.entries(cases))
    expect(folderFor(path)).toBe(folder && `Website/Pages/${folder}`);
  expect(folderFor(['/about'])).toBeNull();
});

test('no token, a bad one or malformed roles are 401', async () => {
  expect((await handler()(post({ path: '/' }, null))).status).toBe(401);
  expect((await handler()(post({ path: '/' }, 'bogus'))).status).toBe(401);
  expect((await handler()(post({ path: '/' }, 'odd-roles'))).status).toBe(401);
});

test('an unknown page or a bad body is 400', async () => {
  expect((await handler()(post({ path: '/nowhere' }))).status).toBe(400);
  expect((await handler()(post({ path: '/../x' }))).status).toBe(400);
  expect((await handler()(post('not json'))).status).toBe(400);
});

test('missing keys are a generic 500', async () => {
  const res = await handler({ env: {} })(post({ path: '/' }));
  expect(res.status).toBe(500);
  expect(await res.json()).toEqual({ error: 'not configured' });
});

test('one address is throttled before its tokens reach Sanity', async () => {
  const { fetcher, calls } = fakeFetch();
  const sign = handler({ fetcher });
  for (let i = 0; i < RATE_LIMIT; i++)
    expect((await sign(post({ path: '/' }, `bogus-${i}`))).status).toBe(401);
  expect((await sign(post({ path: '/' }, 'bogus-x'))).status).toBe(429);
  expect(calls).toHaveLength(RATE_LIMIT);
  // Another address is still served.
  const other = post({ path: '/' }, MEMBER, '198.51.100.7');
  expect((await sign(other)).status).toBe(200);
});

test('a member is checked with Sanity on every request', async () => {
  const { fetcher, calls } = fakeFetch();
  const sign = handler({ fetcher });
  await sign(post({ path: '/' }));
  await sign(post({ path: '/' }));
  expect(calls).toHaveLength(2);
});

test('a member gets the fixed params, signed, and never the secret', async () => {
  const res = await handler()(post({ path: '/about', folder: 'Private' }));
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).not.toContain(SECRET);
  const body = JSON.parse(text);
  expect(body.params).toEqual({
    allowed_formats: 'avif,jpg,png,webp',
    folder: 'Website/Pages/about',
    overwrite: false,
    public_id: '3d-poster-abc123',
    timestamp: NOW / 1000
  });
  expect(body.apiKey).toBe('1234');
  expect(body.cloudName).toBe('ruben-p');
  expect(body.signature).toBe(signParams(body.params, SECRET));
});

import { expect, test } from 'bun:test';
import { createPageSpeedHandler, psiSummary } from './pagespeed';

const MEMBER = 'member-token';
const KEY = 'fake-pagespeed-key';
const SITE = 'https://www.example.com';
const LIGHTHOUSE = {
  lighthouseResult: {
    categories: { seo: { score: 0.9, auditRefs: [{ id: 'image-alt' }] } },
    audits: {
      'image-alt': {
        title: 'Image elements do not have [alt] attributes',
        score: 0,
        scoreDisplayMode: 'binary'
      }
    }
  }
};

// Sanity knows one member; Google answers with `google` and records what it was asked.
function fakeFetch(google = () => Response.json(LIGHTHOUSE)) {
  const asked = [];
  const fetcher = async (url, init) => {
    if (url.includes('pagespeedonline')) {
      asked.push(new URL(url));
      return google();
    }
    return init.headers.Authorization === `Bearer ${MEMBER}`
      ? Response.json({ id: 'u1', roles: [{ name: 'editor' }] })
      : Response.json({ statusCode: 401 }, { status: 401 });
  };
  return { fetcher, asked };
}

const post = (handler, url, token = MEMBER) =>
  handler(
    new Request('http://localhost/api/studio/pagespeed', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '203.0.113.1',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({ url })
    })
  );

const handler = (fetcher) =>
  createPageSpeedHandler({
    fetch: fetcher,
    env: { PAGESPEED_API_KEY: KEY },
    site: SITE
  });

test('only Studio members can spend the quota', async () => {
  const { fetcher, asked } = fakeFetch();
  expect((await post(handler(fetcher), `${SITE}/about`, null)).status).toBe(
    401
  );
  expect(
    (await post(handler(fetcher), `${SITE}/about`, 'stranger')).status
  ).toBe(401);
  expect(asked).toHaveLength(0);
});

test('checks only the site’s own pages', async () => {
  const { fetcher, asked } = fakeFetch();
  const run = handler(fetcher);
  expect((await post(run, 'https://evil.example/')).status).toBe(400);
  expect((await post(run, 'not a url')).status).toBe(400);
  expect(asked).toHaveLength(0);
});

test('asks Google with the server key and returns only the summary', async () => {
  const { fetcher, asked } = fakeFetch();
  const res = await post(handler(fetcher), `${SITE}/about`);
  expect(res.status).toBe(200);
  const body = await res.text();
  expect(JSON.parse(body)).toEqual({
    score: 90,
    failing: ['Image elements do not have [alt] attributes']
  });
  expect(body).not.toContain(KEY);
  expect(asked[0].searchParams.get('key')).toBe(KEY);
  expect(asked[0].searchParams.get('url')).toBe(`${SITE}/about`);
});

test("Google's spent quota reads as 503, not the route's own limit", async () => {
  const { fetcher } = fakeFetch(() => new Response('', { status: 429 }));
  expect((await post(handler(fetcher), `${SITE}/about`)).status).toBe(503);
});

test('a key Google rejects reads as 500, not a passing outage', async () => {
  const { fetcher } = fakeFetch(() => new Response('', { status: 403 }));
  expect((await post(handler(fetcher), `${SITE}/about`)).status).toBe(500);
});

test('psiSummary keeps failing audits it could judge', () => {
  const data = {
    lighthouseResult: {
      categories: {
        seo: {
          score: 0.83,
          auditRefs: [
            { id: 'is-crawlable' },
            { id: 'meta-description' },
            { id: 'structured-data' },
            { id: 'hreflang' },
            { id: 'image-alt' }
          ]
        }
      },
      audits: {
        'is-crawlable': {
          title: 'Page is blocked from indexing',
          score: 0,
          scoreDisplayMode: 'binary'
        },
        'meta-description': {
          title: 'Document has a meta description',
          score: 1,
          scoreDisplayMode: 'binary'
        },
        'structured-data': {
          title: 'Structured data is valid',
          score: null,
          scoreDisplayMode: 'manual'
        },
        hreflang: {
          title: 'Document has a valid hreflang',
          score: null,
          scoreDisplayMode: 'notApplicable'
        },
        'image-alt': {
          title: 'Image elements do not have [alt] attributes',
          score: 0,
          scoreDisplayMode: 'binary'
        }
      }
    }
  };
  expect(psiSummary(data)).toEqual({
    score: 83,
    failing: [
      'Page is blocked from indexing',
      'Image elements do not have [alt] attributes'
    ]
  });
  expect(psiSummary({})).toBeNull();
});

import { expect, test } from 'bun:test';
import { MAX_BODY, MAX_ITEMS } from './studioReviewLimits';
import {
  RATE_LIMIT,
  createReviewHandler,
  parseModelJson,
  soundsLikeAi
} from './studioReview';

const MEMBER = 'member-token';
const KEY = { OPENROUTER_API_KEY: 'sk-test' };

// Sanity knows one member; anything else is a stranger or no session at all.
function fakeFetch(answer = { fixes: [] }) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push(url);
    if (url.includes('/users/me')) {
      const auth = init.headers.Authorization;
      if (auth === `Bearer ${MEMBER}`)
        return Response.json({ id: 'u1', roles: [{ name: 'administrator' }] });
      if (auth === 'Bearer viewer')
        return Response.json({ id: 'p-robot', roles: [{ name: 'viewer' }] });
      if (auth === 'Bearer robot-editor')
        return Response.json({
          id: 'p-robot2',
          provider: 'sanity-token',
          roles: [{ name: 'editor' }]
        });
      if (auth === 'Bearer outsider')
        return Response.json({ id: 'u2', roles: [] });
      return Response.json({ statusCode: 401 }, { status: 401 });
    }
    return Response.json({
      choices: [{ message: { content: JSON.stringify(answer) } }]
    });
  };
  return { fetcher, calls };
}

const post = (body, token = MEMBER) =>
  new Request('http://localhost/api/studio/review', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });

const proofread = {
  task: 'proofread',
  items: [{ key: 'a', text: 'Teh cat.' }]
};

test('no bearer token is 401 without calling anyone', async () => {
  const { fetcher, calls } = fakeFetch();
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post(proofread, null)
  );
  expect(res.status).toBe(401);
  expect(calls).toHaveLength(0);
});

test('a token Sanity rejects is 401', async () => {
  const { fetcher } = fakeFetch();
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post(proofread, 'bogus')
  );
  expect(res.status).toBe(401);
});

test('a Sanity user outside the project is 401', async () => {
  const { fetcher } = fakeFetch();
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post(proofread, 'outsider')
  );
  expect(res.status).toBe(401);
});

test('a robot token is 401 even with an edit role', async () => {
  const { fetcher } = fakeFetch();
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post(proofread, 'robot-editor')
  );
  expect(res.status).toBe(401);
});

test("a read-only token, like the site's preview token, is 401", async () => {
  const { fetcher } = fakeFetch();
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post(proofread, 'viewer')
  );
  expect(res.status).toBe(401);
});

test('a member without a configured key gets 503 and spends nothing', async () => {
  const { fetcher, calls } = fakeFetch();
  const res = await createReviewHandler({ fetch: fetcher, env: {} })(
    post(proofread)
  );
  expect(res.status).toBe(503);
  expect(calls.some((url) => url.includes('openrouter'))).toBe(false);
});

test('a verified token is cached', async () => {
  const { fetcher, calls } = fakeFetch();
  const handle = createReviewHandler({ fetch: fetcher, env: KEY });
  await handle(post(proofread));
  await handle(post(proofread));
  expect(calls.filter((url) => url.includes('/users/me'))).toHaveLength(1);
});

test('an oversize body is 413', async () => {
  const { fetcher } = fakeFetch();
  const text = 'x'.repeat(MAX_BODY);
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post({ task: 'proofread', items: [{ key: 'a', text }] })
  );
  expect(res.status).toBe(413);
});

test('too many items is 413', async () => {
  const { fetcher } = fakeFetch();
  const items = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({
    key: String(i),
    text: 'Hi.'
  }));
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post({ task: 'proofread', items })
  );
  expect(res.status).toBe(413);
});

test('a task smuggled in an array is 400 and spends nothing', async () => {
  const { fetcher, calls } = fakeFetch();
  const items = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({
    key: String(i),
    text: 'Hi.'
  }));
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post({ task: ['proofread'], items })
  );
  expect(res.status).toBe(400);
  expect(calls.some((url) => url.includes('openrouter'))).toBe(false);
});

test('an unknown task is 400', async () => {
  const { fetcher } = fakeFetch();
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post({ task: 'toString' })
  );
  expect(res.status).toBe(400);
});

test('the rate limit answers 429 and lifts after the window', async () => {
  const { fetcher } = fakeFetch();
  let clock = 0;
  const handle = createReviewHandler({
    fetch: fetcher,
    env: KEY,
    now: () => clock
  });
  for (let i = 0; i < RATE_LIMIT; i++)
    expect((await handle(post(proofread))).status).toBe(200);
  expect((await handle(post(proofread))).status).toBe(429);
  clock += 11 * 60_000;
  expect((await handle(post(proofread))).status).toBe(200);
});

test('proofread keeps only fixes that quote their passage and read human', async () => {
  const { fetcher } = fakeFetch({
    fixes: [
      { key: 'a', original: 'Teh', suggestion: 'The', reason: 'Spelling' },
      { key: 'a', original: 'Dog', suggestion: 'dog', reason: 'Invented' },
      { key: 'b', original: 'Teh', suggestion: 'The', reason: 'Wrong key' },
      { key: 'a', original: 'cat', suggestion: 'vibrant cat', reason: 'Hype' },
      { key: 'a', original: 'Teh cat.', suggestion: ' ', reason: 'Delete it' }
    ]
  });
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post(proofread)
  );
  expect(await res.json()).toEqual({
    dismissed: [],
    fixes: [
      { key: 'a', original: 'Teh', suggestion: 'The', reason: 'Spelling' }
    ]
  });
});

test('spelling flags reach the model and only sent ids come back dismissed', async () => {
  const { fetcher } = fakeFetch({
    fixes: [],
    dismissed: ['a:6:3', 'a:6:3', 'made-up']
  });
  let sent;
  const spy = async (url, init) => {
    if (url.includes('openrouter')) sent = JSON.parse(init.body);
    return fetcher(url, init);
  };
  const flagged = {
    task: 'proofread',
    items: [
      {
        key: 'a',
        text: 'Check da gram…',
        flags: [
          {
            id: 'a:6:3',
            offset: 6,
            length: 3,
            message: 'Did you mean "dag"?',
            suggestion: 'dag '
          },
          { id: 'a:13:1', offset: 13, length: 1, message: 'x'.repeat(500) }
        ]
      }
    ]
  };
  const res = await createReviewHandler({ fetch: spy, env: KEY })(
    post(flagged)
  );
  expect((await res.json()).dismissed).toEqual(['a:6:3']);
  const item = JSON.parse(sent.messages[1].content).items[0];
  expect(item.flags[0]).toEqual({
    id: 'a:6:3',
    flagged: 'da ',
    message: 'Did you mean "dag"?',
    suggestion: 'dag '
  });
  expect(item.flags[1].message).toHaveLength(200);
  expect(item.flags[1]).not.toHaveProperty('suggestion');
});

test('malformed or too many flags are 400 before any spend', async () => {
  const { fetcher, calls } = fakeFetch();
  const handle = createReviewHandler({ fetch: fetcher, env: KEY });
  const withFlags = (flags) => ({
    task: 'proofread',
    items: [{ key: 'a', text: 'Teh cat.', flags }]
  });
  const flag = (offset, length = 1) => ({
    id: `a:${offset}`,
    offset,
    length,
    message: 'm'
  });
  for (const flags of [
    [flag(7, 5)],
    [{ ...flag(0), offset: 1.5 }],
    [{ ...flag(0), id: 3 }],
    [{ ...flag(0), suggestion: 7 }],
    'nope',
    Array.from({ length: 21 }, () => flag(0))
  ])
    expect((await handle(post(withFlags(flags)))).status).toBe(400);
  expect(calls.some((url) => url.includes('openrouter'))).toBe(false);
});

test('seo answers are checked and AI-sounding suggestions dropped', async () => {
  const { fetcher } = fakeFetch({
    verdict: 'okay',
    notes: [
      { about: 'title', text: 'Name the project.' },
      { about: 'layout', text: 'Not a field.' },
      { about: 'description', text: 'A vibrant hook would help.' },
      'A bare string.',
      { about: 'page', text: '  Say what you shoot.  ' },
      { about: 'keyphrase', text: 'Use it in the title.' },
      { about: 'description', text: 'Too short.' },
      { about: 'title', text: 'Past the cap.' }
    ],
    title: 'Projects that elevate brands',
    description: 'Work I have made for clients.',
    keyphrases: [
      {
        phrase: 'Night Car  Photography Melbourne',
        reason: 'What the page shows.'
      },
      { phrase: 'night car photography melbourne', reason: 'A repeat.' },
      { phrase: 'x', reason: 'Too short.' },
      { phrase: 'vibrant night shots', reason: 'An AI tell.' },
      { phrase: 'jane citizen', reason: 'The author, on their own page.' },
      { phrase: 'melbourne car photographer', reason: 'Another angle.' },
      { phrase: 'a fourth one', reason: 'Past the cap.' },
      { phrase: 42, reason: 'Not a string.' }
    ]
  });
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post({ task: 'seo', title: 'Work', description: '' })
  );
  expect(await res.json()).toEqual({
    verdict: 'okay',
    notes: [
      { about: 'title', text: 'Name the project.' },
      { about: 'page', text: 'Say what you shoot.' },
      { about: 'keyphrase', text: 'Use it in the title.' },
      { about: 'description', text: 'Too short.' }
    ],
    title: '',
    description: 'Work I have made for clients.',
    keyphrases: [
      {
        phrase: 'night car photography melbourne',
        reason: 'What the page shows.'
      },
      { phrase: 'jane citizen', reason: 'The author, on their own page.' },
      { phrase: 'melbourne car photographer', reason: 'Another angle.' }
    ]
  });
});

test('an seo answer without keyphrases still reads, with none', async () => {
  const { fetcher } = fakeFetch({
    verdict: 'weak',
    notes: [],
    title: 'Night drives',
    description: ''
  });
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post({ task: 'seo', title: '', description: '' })
  );
  expect((await res.json()).keyphrases).toEqual([]);
});

test('a malformed model answer is 502', async () => {
  const { fetcher } = fakeFetch({ verdict: 'great' });
  const res = await createReviewHandler({ fetch: fetcher, env: KEY })(
    post({ task: 'seo', title: 'Work' })
  );
  expect(res.status).toBe(502);
});

test('parseModelJson reads fenced JSON and refuses prose', () => {
  expect(parseModelJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  expect(parseModelJson('Sure! Here it is')).toBeNull();
});

test('soundsLikeAi lets the author keep their own words', () => {
  expect(soundsLikeAi('A seamless fit')).toBe(true);
  expect(soundsLikeAi('A seamless fit', 'A seamless fitt')).toBe(false);
  expect(soundsLikeAi('Fast — and light')).toBe(true);
  expect(soundsLikeAi("It's not just fast, it's light")).toBe(true);
  expect(soundsLikeAi('Fast and light')).toBe(false);
});

test('soundsLikeAi catches the humanizer tells, one tell at a time', () => {
  for (const text of [
    'Nestled in Fitzroy, my studio',
    'The shoot serves as a reminder',
    'It underscores the mood',
    'Showcasing the night',
    'An intricate interplay of light',
    'Shot 2019 – 2021 in the city',
    'Meticulously lit',
    'Let that sink in.'
  ])
    expect(soundsLikeAi(text)).toBe(true);
  // A tell the author already wrote is theirs to keep, but only that one.
  expect(soundsLikeAi('a vibrant street', 'the vibrant street')).toBe(false);
  expect(soundsLikeAi('a vibrant testament', 'the vibrant street')).toBe(true);
});

test('everyday words are not tells', () => {
  for (const text of [
    'The key shot is the rich blue one',
    'I stood on the bridge as the cars passed',
    'A 2019–2021 series',
    'Crucial to get the timing right'
  ])
    expect(soundsLikeAi(text)).toBe(false);
});

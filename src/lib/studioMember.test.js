import { expect, test } from 'bun:test';
import {
  BUSY,
  UNAVAILABLE,
  createMemberCheck,
  createRateLimit
} from './studioMember';

test('a full table of live keys drops the oldest instead of refusing newcomers', () => {
  const overLimit = createRateLimit({
    limit: 2,
    window: 1000,
    now: () => 0
  });
  overLimit('a');
  overLimit('a');
  expect(overLimit('a')).toBe(true);
  for (let i = 0; i < 500; i++) overLimit(`other-${i}`);
  // A newcomer is let in and the oldest key, 'a', is forgotten.
  expect(overLimit('new')).toBe(false);
  expect(overLimit('a')).toBe(false);
});

test('too many checks in flight at once are refused', async () => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const memberOf = createMemberCheck({
    fetch: async () => {
      await gate;
      return Response.json({ statusCode: 401 }, { status: 401 });
    }
  });
  const ask = (token) =>
    memberOf(
      new Request('http://localhost/', {
        headers: { Authorization: `Bearer ${token}` }
      })
    );
  const waiting = Array.from({ length: 20 }, (_, i) => ask(`t${i}`));
  expect(await ask('one-more')).toBe(BUSY);
  release();
  expect(await Promise.all(waiting)).toEqual(Array(20).fill(null));
});

test('an outage is UNAVAILABLE, not a refusal, and is asked again', async () => {
  let answer = new Response('down', { status: 503 });
  const memberOf = createMemberCheck({ fetch: async () => answer });
  const ask = () =>
    memberOf(
      new Request('http://localhost/', {
        headers: { Authorization: 'Bearer t' }
      })
    );
  expect(await ask()).toBe(UNAVAILABLE);
  answer = Response.json({ id: 'u1', roles: [{ name: 'editor' }] });
  expect(await ask()).toBe('u1');
  answer = Response.json({ statusCode: 401 }, { status: 401 });
  // The verified id is cached for a minute, so the refusal is not seen yet.
  expect(await ask()).toBe('u1');
});

test('a failed request is UNAVAILABLE', async () => {
  const memberOf = createMemberCheck({
    fetch: async () => {
      throw new Error('offline');
    }
  });
  const request = new Request('http://localhost/', {
    headers: { Authorization: 'Bearer t' }
  });
  expect(await memberOf(request)).toBe(UNAVAILABLE);
});

import { expect, test } from 'bun:test';
import { BUSY, createMemberCheck, createRateLimit } from './studioMember';

test('a key inside its window is never evicted to make room', () => {
  let time = 0;
  const overLimit = createRateLimit({
    limit: 2,
    window: 1000,
    now: () => time
  });
  overLimit('a');
  overLimit('a');
  expect(overLimit('a')).toBe(true);
  for (let i = 0; i < 500; i++) overLimit(`other-${i}`);
  expect(overLimit('a')).toBe(true);
  // A full table of active keys refuses newcomers rather than forget one.
  expect(overLimit('new')).toBe(true);
  // Once their windows pass, the old keys make room.
  time = 2000;
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

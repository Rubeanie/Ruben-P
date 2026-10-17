import { afterEach, expect, mock, test } from 'bun:test';
import { loadPhoto } from './photo';

const image = {
  asset: {
    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg'
  }
};
const realFetch = globalThis.fetch;
const realError = console.error;
afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

test('a photo that is gone or will not decode comes back null', async () => {
  console.error = mock(() => {});
  for (const failure of [
    () => Promise.resolve(new Response('gone', { status: 404 })),
    () => Promise.resolve(new Response('not an image', { status: 200 }))
  ]) {
    globalThis.fetch = mock(failure);
    expect(await loadPhoto(image)).toBeNull();
  }
  expect(console.error).toHaveBeenCalledTimes(2);
});

test('a transient failure throws, so the card is not drawn without its photo', async () => {
  for (const failure of [
    () => Promise.reject(new Error('offline')),
    () => Promise.resolve(new Response('', { status: 503 })),
    () => Promise.resolve(new Response('', { status: 429 }))
  ]) {
    globalThis.fetch = mock(failure);
    await expect(loadPhoto(image)).rejects.toThrow();
  }
});

test('a body that breaks after a 200 throws too', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(
        new ReadableStream({ pull: (c) => c.error(new Error('reset')) })
      )
    )
  );
  await expect(loadPhoto(image)).rejects.toThrow();
});

test('the Start frame of a clip is cut to the card around its subject', async () => {
  console.error = mock(() => {});
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response('', { status: 404 }))
  );
  const clip = {
    asset: {
      secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/a.mp4'
    },
    clip: { start: 2 }
  };
  await loadPhoto(clip);
  expect(globalThis.fetch.mock.calls[0][0]).toBe(
    'https://res.cloudinary.com/demo/video/upload/so_2,f_webp/c_fill,g_auto,w_1200,h_630,q_85/v1/a.webp'
  );
});

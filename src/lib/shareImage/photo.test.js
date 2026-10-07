import { afterEach, expect, mock, test } from 'bun:test';
import { loadPhoto } from './photo';

const image = {
  asset: {
    _id: 'image-0123456789abcdef0123456789abcdef01234567-1200x630-jpg',
    url: 'https://cdn.sanity.io/images/p/d/0123456789abcdef0123456789abcdef01234567-1200x630.jpg'
  }
};
const realFetch = globalThis.fetch;
const realError = console.error;
afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

test('a photo that fails to load, answers an error or will not decode comes back null', async () => {
  console.error = mock(() => {});
  for (const failure of [
    () => Promise.reject(new Error('offline')),
    () => Promise.resolve(new Response('gone', { status: 404 })),
    () => Promise.resolve(new Response('not an image', { status: 200 }))
  ]) {
    globalThis.fetch = mock(failure);
    expect(await loadPhoto(image)).toBeNull();
  }
  expect(console.error).toHaveBeenCalledTimes(3);
});

test('a Cloudinary cover still is cut to the card around its subject', async () => {
  console.error = mock(() => {});
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response('', { status: 404 }))
  );
  const clip = {
    _type: 'cloudinaryImage',
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

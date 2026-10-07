import { expect, test } from 'bun:test';
import { resolveImage } from './imageBlock';

const derived = {
  palette: { dominant: { background: '#112233' } },
  focus: { x: 0.29, y: 0.5 },
  lqip: 'data:image/webp;base64,AAAA'
};

test('a still image is its own still and does not move', () => {
  const src = 'https://res.cloudinary.com/demo/image/upload/v1/a.webp';
  expect(
    resolveImage({
      asset: { secure_url: src, width: 1920, height: 1080 },
      ...derived
    })
  ).toEqual({
    src,
    still: src,
    width: 1920,
    height: 1080,
    clip: null,
    moving: false,
    ...derived
  });
  expect(resolveImage(null)).toBeNull();
  expect(resolveImage({ asset: {} })).toBeNull();
});

test('a clip rests on its Start frame; a GIF on its first', () => {
  const clip = resolveImage({
    asset: {
      secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/a.mp4'
    },
    clip: { start: 1.5, playOnce: true }
  });
  expect(clip.still).toBe(
    'https://res.cloudinary.com/demo/video/upload/so_1.5,f_webp/v1/a.webp'
  );
  expect(clip).toMatchObject({
    moving: true,
    clip: { start: 1.5, loop: false, video: true }
  });
  const gif = resolveImage({
    asset: {
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/a.gif',
      derived_url: 'https://res.cloudinary.com/demo/image/upload/t_x/v1/a.gif'
    }
  });
  expect(gif).toMatchObject({
    src: 'https://res.cloudinary.com/demo/image/upload/t_x/v1/a.gif',
    still: 'https://res.cloudinary.com/demo/image/upload/pg_1/t_x/v1/a.gif',
    moving: true,
    clip: null
  });
});

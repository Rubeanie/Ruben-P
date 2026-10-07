import { expect, test } from 'bun:test';
import { placeholderFor, resolveImage } from './imageBlock';

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
    ...derived,
    position: '29% 50%',
    placeholder: placeholderFor({ ...derived, width: 1920, height: 1080 })
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

test('the placeholder is the blurred lqip unless blur is off, then the colour', () => {
  const svg = (url) => decodeURIComponent(url.split(',').slice(1).join(','));
  const blurred = svg(
    placeholderFor({ ...derived, width: 1920, height: 1080 })
  );
  // In the image's own shape, so cover-fit frames it like the photo.
  expect(blurred).toContain("viewBox='0 0 100 56'");
  expect(blurred).toContain(`href='${derived.lqip}'`);
  // A 3:4 cut of it centres on the subject, clamped to the image.
  expect(
    svg(placeholderFor({ ...derived, width: 1920, height: 1080 }, 3 / 4))
  ).toContain("viewBox='8 0 42 56'");
  expect(svg(placeholderFor({ ...derived, blur: false }))).toContain(
    "fill='#112233'"
  );
  // No lqip falls back to the colour; nothing usable leaves next/image's default.
  expect(placeholderFor({ palette: derived.palette })).toBe(
    placeholderFor({ ...derived, blur: false })
  );
  expect(placeholderFor({ blur: false })).toBe('empty');
  expect(
    placeholderFor({
      blur: false,
      palette: { dominant: { background: "red'" } }
    })
  ).toBe('empty');
});

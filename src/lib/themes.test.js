import { expect, test } from 'bun:test';
import {
  landscapeRendition,
  nextThemeAfter,
  portraitRendition,
  stillRendition,
  themeGate,
  themeRendition
} from './themes';

test('nextThemeAfter steps in list order, wraps, and starts at the first', () => {
  const themes = [{ url: 'a' }, { url: 'b' }, { url: 'c' }];

  expect(nextThemeAfter(themes, 'a')).toBe(themes[1]);
  expect(nextThemeAfter(themes, 'c')).toBe(themes[0]);
  expect(nextThemeAfter(themes, 'blob:photo')).toBe(themes[0]);
  expect(nextThemeAfter(themes, undefined)).toBe(themes[0]);
  expect(nextThemeAfter([], 'a')).toBe(null);
});

test('themeRendition shrinks Cloudinary photos', () => {
  expect(
    themeRendition('https://res.cloudinary.com/c/image/upload/v1/a.png')
  ).toBe('https://res.cloudinary.com/c/image/upload/w_800,f_jpg,q_80/v1/a.png');
  expect(
    themeRendition(
      'https://res.cloudinary.com/c/image/upload/t_x/f_avif,w_2000/v12/d/a.avif'
    )
  ).toBe(
    'https://res.cloudinary.com/c/image/upload/t_x/f_avif,w_2000/w_800,f_jpg,q_80/v12/d/a.avif'
  );
  expect(themeRendition('https://example.com/a.png')).toBe(
    'https://example.com/a.png'
  );
});

test('landscapeRendition sizes Cloudinary photos', () => {
  expect(
    landscapeRendition(
      'https://res.cloudinary.com/c/image/upload/t_x/v12/d/a.avif'
    )
  ).toBe(
    'https://res.cloudinary.com/c/image/upload/t_x/c_limit,w_1920,f_auto,q_auto/v12/d/a.avif'
  );
  expect(landscapeRendition('https://example.com/a.png')).toBe(
    'https://example.com/a.png'
  );
});

test('portraitRendition crops wide CDN photos to their middle 3:4', () => {
  expect(
    portraitRendition(
      'https://res.cloudinary.com/c/image/upload/t_auto-optimised/v12/d/a.avif'
    )
  ).toBe(
    'https://res.cloudinary.com/c/image/upload/t_auto-optimised/if_ar_gt_0.75/c_fill,ar_3:4,g_auto/if_end/c_limit,h_1600,f_auto,q_auto/v12/d/a.avif'
  );
});

test('portraitRendition keeps the original on other hosts', () => {
  for (const url of [
    'https://res.cloudinary.com/c/image/upload/a.png',
    'https://example.com/a-1920x1080.jpg',
    'blob:https://ruben-p.com/0b7e',
    'not a url'
  ]) {
    expect(portraitRendition(url)).toBe(url);
  }
});

test('themeGate hands each theme its portrait crop', () => {
  const url = 'https://res.cloudinary.com/c/image/upload/v1/a.avif';
  const gate = themeGate([{ url, colors: { background: '#000' } }]);

  expect(gate).toContain(JSON.stringify(portraitRendition(url)));
  expect(gate).toContain(JSON.stringify(landscapeRendition(url)));
});

test('a Cloudinary video themes the page as a looping animation, six seconds at most', () => {
  const video = 'https://res.cloudinary.com/c/video/upload/v1/d/a.mp4';
  expect(themeRendition(video)).toBe(
    'https://res.cloudinary.com/c/video/upload/so_0,w_800,f_jpg,q_80/v1/d/a.mp4'
  );
  expect(landscapeRendition(video)).toBe(
    'https://res.cloudinary.com/c/video/upload/du_6/c_limit,w_1920/fps_15/e_loop/fl_animated,fl_awebp,f_webp/v1/d/a.mp4'
  );
  expect(portraitRendition(video)).toBe(landscapeRendition(video));
});

test('a video theme has a first-frame still for reduced motion, a photo none', () => {
  const video = 'https://res.cloudinary.com/c/video/upload/v1/d/a.mp4';
  const still =
    'https://res.cloudinary.com/c/video/upload/so_0,f_webp/c_limit,w_1920,f_auto,q_auto/v1/d/a.webp';
  expect(stillRendition(video)).toBe(still);
  expect(
    stillRendition('https://res.cloudinary.com/c/image/upload/v1/a.png')
  ).toBeNull();
  expect(themeGate([{ url: video, colors: { background: '#000' } }])).toContain(
    JSON.stringify(still)
  );
});

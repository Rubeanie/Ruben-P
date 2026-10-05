import { expect, test } from 'bun:test';
import { nextThemeAfter, themeRendition } from './themes';

test('nextThemeAfter steps in list order, wraps, and starts at the first', () => {
  const themes = [{ url: 'a' }, { url: 'b' }, { url: 'c' }];

  expect(nextThemeAfter(themes, 'a')).toBe(themes[1]);
  expect(nextThemeAfter(themes, 'c')).toBe(themes[0]);
  expect(nextThemeAfter(themes, 'blob:photo')).toBe(themes[0]);
  expect(nextThemeAfter(themes, undefined)).toBe(themes[0]);
  expect(nextThemeAfter([], 'a')).toBe(null);
});

test('themeRendition shrinks Sanity and Cloudinary photos', () => {
  expect(themeRendition('https://cdn.sanity.io/images/p/d/a-10x10.png')).toBe(
    'https://cdn.sanity.io/images/p/d/a-10x10.png?w=800&fm=jpg&q=80'
  );
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

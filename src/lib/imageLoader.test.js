import { describe, expect, test } from 'bun:test';
import { loaderFor, stillFrame } from './imageLoader';

const load = (src, width, quality) => loaderFor(src)({ src, width, quality });

describe('loaderFor', () => {
  test('sizes Sanity images on the Sanity CDN', () => {
    const url = new URL(
      load('https://cdn.sanity.io/images/p/d/abc-800x600.jpg', 640, 75)
    );
    expect(url.host).toBe('cdn.sanity.io');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      w: '640',
      q: '75',
      auto: 'format',
      fit: 'max'
    });
  });

  test('inserts the Cloudinary transform before the version', () => {
    expect(
      load(
        'https://res.cloudinary.com/ruben-p/image/upload/v1645499430/Images/a.webp',
        828
      )
    ).toBe(
      'https://res.cloudinary.com/ruben-p/image/upload/c_limit,f_auto,q_auto,w_828/v1645499430/Images/a.webp'
    );
  });

  test('keeps existing Cloudinary transforms ahead of its own', () => {
    expect(
      load(
        'https://res.cloudinary.com/ruben-p/image/upload/e_grayscale/c_fill,w_100/v12/Images/a.webp',
        1200
      )
    ).toBe(
      'https://res.cloudinary.com/ruben-p/image/upload/e_grayscale/c_fill,w_100/c_limit,f_auto,q_auto,w_1200/v12/Images/a.webp'
    );
  });

  test('leaves unversioned Cloudinary URLs to the default optimizer', () => {
    expect(
      loaderFor('https://res.cloudinary.com/ruben-p/image/upload/Images/a.webp')
    ).toBeUndefined();
  });

  test('leaves other hosts and static imports to the default optimizer', () => {
    expect(loaderFor('https://i.ytimg.com/vi/x/hqdefault.jpg')).toBeUndefined();
    expect(loaderFor('/images/a.jpg')).toBeUndefined();
    expect(loaderFor({ src: '/a.jpg', width: 1, height: 1 })).toBeUndefined();
  });
});

test('stillFrame asks each CDN for the first frame', () => {
  expect(stillFrame('https://cdn.sanity.io/images/p/d/a-640x360.gif')).toBe(
    'https://cdn.sanity.io/images/p/d/a-640x360.gif?frame=1'
  );
  expect(stillFrame('https://cdn.sanity.io/images/p/d/a.gif?dl=1')).toBe(
    'https://cdn.sanity.io/images/p/d/a.gif?dl=1&frame=1'
  );
  expect(
    stillFrame('https://res.cloudinary.com/demo/image/upload/v1/kittens.gif')
  ).toBe('https://res.cloudinary.com/demo/image/upload/pg_1/v1/kittens.gif');
});

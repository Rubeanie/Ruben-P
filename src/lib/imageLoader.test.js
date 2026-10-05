import { describe, expect, test } from 'bun:test';
import { cdnLoader, hasCdnLoader } from './imageLoader';

describe('cdnLoader', () => {
  test('sizes Sanity images on the Sanity CDN', () => {
    const url = new URL(
      cdnLoader({
        src: 'https://cdn.sanity.io/images/p/d/abc-800x600.jpg',
        width: 640,
        quality: 75
      })
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
      cdnLoader({
        src: 'https://res.cloudinary.com/ruben-p/image/upload/v1645499430/Images/a.webp',
        width: 828
      })
    ).toBe(
      'https://res.cloudinary.com/ruben-p/image/upload/c_limit,f_auto,q_auto,w_828/v1645499430/Images/a.webp'
    );
  });

  test('keeps existing Cloudinary transforms ahead of its own', () => {
    expect(
      cdnLoader({
        src: 'https://res.cloudinary.com/ruben-p/image/upload/e_grayscale/c_fill,w_100/v12/Images/a.webp',
        width: 1200
      })
    ).toBe(
      'https://res.cloudinary.com/ruben-p/image/upload/e_grayscale/c_fill,w_100/c_limit,f_auto,q_auto,w_1200/v12/Images/a.webp'
    );
  });

  test('leaves other hosts to the default optimizer', () => {
    const src = 'https://i.ytimg.com/vi/x/hqdefault.jpg';
    expect(cdnLoader({ src, width: 640 })).toBeNull();
    expect(hasCdnLoader(src)).toBe(false);
    expect(hasCdnLoader('https://cdn.sanity.io/a.jpg')).toBe(true);
  });
});

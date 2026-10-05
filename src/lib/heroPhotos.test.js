import { describe, expect, test } from 'bun:test';
import { heroPhotos } from './heroPhotos';

const image = (url) => ({
  asset: { url, metadata: { dimensions: { aspectRatio: 1.5 } } }
});

describe('heroPhotos', () => {
  test('a desktop and mobile pair split at the phone breakpoint', () => {
    const [desktop, mobile] = heroPhotos({
      _type: 'hero',
      bgImage: image('https://cdn.sanity.io/a.jpg'),
      bgImageMobile: image('https://cdn.sanity.io/b.jpg')
    });
    expect(desktop.media).toBe('not all and (max-width: 43.75rem)');
    expect(mobile.media).toBe('(max-width: 43.75rem)');
    expect(desktop.sizes).toBe(mobile.sizes);
  });

  test('a lone photo has no media', () => {
    const photos = heroPhotos({
      _type: 'hero',
      bgImage: image('https://cdn.sanity.io/a.jpg'),
      bgImageMobile: {}
    });
    expect(photos).toHaveLength(1);
    expect(photos[0].media).toBeUndefined();
  });

  test('other modules have none', () => {
    expect(heroPhotos({ _type: 'callout' })).toEqual([]);
  });
});

import { describe, expect, test } from 'bun:test';
import { heroPhotos } from './heroPhotos';

const image = (url) => ({
  asset: { secure_url: url, width: 1500, height: 1000 }
});
const still = 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg';

describe('heroPhotos', () => {
  test('phones get a portrait cut of a still, split at the breakpoint', () => {
    const [desktop, phone] = heroPhotos({
      _type: 'hero',
      bgImage: image(still)
    });
    expect(desktop).toMatchObject({
      src: still,
      media: 'not all and (max-width: 43.75rem)'
    });
    expect(phone).toMatchObject({
      src: 'https://res.cloudinary.com/demo/image/upload/if_ar_gt_0.75/c_fill,ar_3:4,g_auto/if_end/v1/a.jpg',
      media: '(max-width: 43.75rem)',
      // Sized as the 3:4 cut, which fills a phone by height sooner.
      sizes: '(max-aspect-ratio: 75/100) 75vh, 100vw'
    });
  });

  test('an animation plays whole, with no media; a video over its still', () => {
    const photos = heroPhotos({
      _type: 'hero',
      bgImage: image('https://res.cloudinary.com/demo/video/upload/v1/a.mp4')
    });
    expect(photos).toHaveLength(1);
    expect(photos[0].media).toBeUndefined();
    expect(photos[0].src).toBe(
      'https://res.cloudinary.com/demo/video/upload/so_0,f_webp/v1/a.webp'
    );
  });

  test('the split hero shows a square cut, and a 4:3 one on phones', () => {
    const [photo, phone, ...rest] = heroPhotos({
      _type: 'hero.split',
      image: image(still)
    });
    expect(rest).toHaveLength(0);
    expect(photo).toMatchObject({
      src: 'https://res.cloudinary.com/demo/image/upload/c_fill,ar_1:1,g_auto/v1/a.jpg',
      media: 'not all and (max-width: 43.75rem)',
      sizes:
        '(max-width: 43.75rem) 100vw, (max-aspect-ratio: 130/100) 46vw, 60vh'
    });
    expect(phone).toMatchObject({
      src: 'https://res.cloudinary.com/demo/image/upload/c_fill,ar_4:3,g_auto/v1/a.jpg',
      media: '(max-width: 43.75rem)',
      sizes: '100vw'
    });
  });

  test('a split hero animation plays whole, sized to cover the square', () => {
    const [photo] = heroPhotos({
      _type: 'hero.split',
      image: image('https://res.cloudinary.com/demo/video/upload/v1/a.mp4')
    });
    // 3:2: half as wide again as the square it covers, an eighth wider than
    // the phone's 4:3 frame.
    expect(photo.sizes).toBe(
      '(max-width: 43.75rem) 113vw, (max-aspect-ratio: 130/100) 69vw, 90vh'
    );
    expect(photo.placeholder).toBeUndefined();
  });

  test('other modules, and heroes without a photo, have none', () => {
    expect(heroPhotos({ _type: 'callout' })).toEqual([]);
    expect(heroPhotos({ _type: 'hero.saas', image: null })).toEqual([]);
  });
});

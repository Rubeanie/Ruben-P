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

  test('other modules, and heroes without a photo, have none', () => {
    expect(heroPhotos({ _type: 'callout' })).toEqual([]);
    expect(heroPhotos({ _type: 'hero.saas', image: null })).toEqual([]);
  });
});

import { describe, expect, test } from 'bun:test';
import { carouselSizes } from '@/lib/carousel';
import { clipWidth } from '@/lib/imageBlock';
import { clipUrls, clipWidthsFor } from './cloudinaryDerived';

const clip =
  'https://res.cloudinary.com/ruben-p/video/upload/v1/samples/dance-2.mp4';

describe('clipWidthsFor', () => {
  test('a post cover takes both tile widths', () => {
    expect(clipWidthsFor(['cover'], 'page.post')).toEqual([1200, 1920]);
    expect(clipWidthsFor(['cover'], 'page')).toEqual([]);
  });

  test('an image block uses the width its reader computes', () => {
    const path = ['content', { _key: 'a' }, 'image'];
    expect(clipWidthsFor(path, 'page', { _type: 'imageBlock' })).toEqual([
      1600, 720
    ]);
    expect(
      clipWidthsFor(path, 'page', { _type: 'imageBlock', size: 'small' })
    ).toEqual([800, 720]);
  });

  test('a carousel card uses the carousel sizes', () => {
    const carousel = { items: [1, 2, 3], loop: true, size: 'medium' };
    expect(
      clipWidthsFor(
        ['modules', { _key: 'm' }, 'items', { _key: 'i' }, 'image'],
        'page',
        { _type: 'carouselImage' },
        carousel
      )
    ).toEqual([clipWidth(carouselSizes(3, true, false, 'medium')), 720]);
  });
});

describe('clipUrls', () => {
  test('are the WebM and MP4 per width', () => {
    expect(clipUrls(clip, { fps: 10 }, [1200])).toEqual([
      'https://res.cloudinary.com/ruben-p/video/upload/du_60/c_limit,w_1200/fps_10/ac_none,f_webm,vc_vp9,q_auto/v1/samples/dance-2.webm',
      'https://res.cloudinary.com/ruben-p/video/upload/du_60/c_limit,w_1200/fps_10/ac_none,f_mp4,vc_h264,q_auto/v1/samples/dance-2.mp4'
    ]);
  });

  test('start with the WebM at the first width, which Prepare clip measures', () => {
    const [first] = clipUrls(clip, {}, [1600, 720]);
    expect(first).toContain('/c_limit,w_1600/');
    expect(first).toEndWith('.webm');
  });

  test('skip a forced animated image', () => {
    expect(clipUrls(clip, { animatedImage: true }, [1200])).toEqual([]);
  });

  test('skip an image', () => {
    expect(clipUrls(clip.replace('/video/', '/image/'), {}, [1200])).toEqual(
      []
    );
  });
});

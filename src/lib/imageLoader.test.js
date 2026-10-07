import { describe, expect, test } from 'bun:test';
import {
  animatedClip,
  clipSettings,
  clipVideo,
  isAnimated,
  loaderFor,
  stillFrame
} from './imageLoader';

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

describe('Cloudinary clips', () => {
  const clip =
    'https://res.cloudinary.com/ruben-p/video/upload/v1/samples/dance-2.mp4';

  test('count as animated and play as a sized, looping WebP', () => {
    expect(isAnimated(clip)).toBe(true);
    expect(load(clip, 640)).toBe(
      'https://res.cloudinary.com/ruben-p/video/upload/du_60/c_limit,w_640/fps_15/e_loop/fl_animated,fl_awebp,f_webp/v1/samples/dance-2.mp4'
    );
  });

  test('keep a query string and survive a missing src', () => {
    expect(stillFrame(`${clip}?t=1`)).toBe(
      'https://res.cloudinary.com/ruben-p/video/upload/so_0,f_webp/v1/samples/dance-2.webp?t=1'
    );
    expect(isAnimated(`${stillFrame(clip)}?t=1`)).toBe(false);
    expect(isAnimated(undefined)).toBe(false);
  });

  test('rest on the first frame as a sized still', () => {
    expect(load(stillFrame(clip), 640)).toBe(
      'https://res.cloudinary.com/ruben-p/video/upload/so_0,f_webp/c_limit,f_auto,q_auto,w_640/v1/samples/dance-2.webp'
    );
  });

  test('take their cut, frame rate and loop from the field', () => {
    const cut = { start: 1.5, length: 4, fps: 10, playOnce: true };
    expect(loaderFor(clip, cut)({ src: clip, width: 640 })).toBe(
      'https://res.cloudinary.com/ruben-p/video/upload/so_1.5,du_4/c_limit,w_640/fps_10/fl_animated,fl_awebp,f_webp/v1/samples/dance-2.mp4'
    );
    expect(clipVideo(clip, 1200, cut)).toBe(
      'https://res.cloudinary.com/ruben-p/video/upload/so_1.5,du_4/c_limit,w_1200/fps_10/ac_none,f_mp4,vc_h264,q_auto/v1/samples/dance-2.mp4'
    );
    expect(stillFrame(clip, cut)).toBe(
      'https://res.cloudinary.com/ruben-p/video/upload/so_1.5,f_webp/v1/samples/dance-2.webp'
    );
  });

  test('play once after being settled again', () => {
    const cut = clipSettings({ playOnce: true });
    expect(clipSettings(cut)).toEqual(cut);
    expect(animatedClip(clip, 'w_10', cut)).not.toContain('e_loop');
    // The video's loop attribute reads the settled clip.
    expect(cut.loop).toBe(false);
  });

  test('hold the cap whatever the field says', () => {
    expect(clipSettings({ length: 90, fps: 60, start: -2 })).toEqual({
      start: 0,
      length: 60,
      fps: 15,
      loop: true
    });
    expect(animatedClip(clip, 'w_10', { length: 0 })).toContain('/du_60/');
  });

  test('a shorter cap holds, and blank runs to it', () => {
    expect(clipSettings({ length: 90 }, 6).length).toBe(6);
    expect(clipSettings({}, 6).length).toBe(6);
  });

  test('keep the original frame rate when asked', () => {
    expect(clipVideo(clip, 720, { fps: 0 })).not.toContain('fps_');
    expect(animatedClip(clip, 'w_10', { fps: 0 })).not.toContain('fps_');
  });

  test('play as an MP4 whatever the upload was', () => {
    expect(clipVideo(clip.replace('.mp4', '.mov?t=1'), 720)).toBe(
      'https://res.cloudinary.com/ruben-p/video/upload/du_60/c_limit,w_720/fps_15/ac_none,f_mp4,vc_h264,q_auto/v1/samples/dance-2.mp4?t=1'
    );
  });
});

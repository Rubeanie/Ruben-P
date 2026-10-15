import { expect, test } from 'bun:test';
import {
  DEFAULT_THEME_COLORS,
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
  ).toBe('https://res.cloudinary.com/c/image/upload/w_200,f_png/v1/a.png');
  expect(
    themeRendition(
      'https://res.cloudinary.com/c/image/upload/t_x/f_avif,w_2000/v12/d/a.avif'
    )
  ).toBe(
    'https://res.cloudinary.com/c/image/upload/t_x/f_avif,w_2000/w_200,f_png/v12/d/a.avif'
  );
  expect(() => themeRendition('https://example.com/a.png')).toThrow();
});

test('landscapeRendition sizes Cloudinary photos', () => {
  expect(
    landscapeRendition(
      'https://res.cloudinary.com/c/image/upload/t_x/v12/d/a.avif'
    )
  ).toBe(
    'https://res.cloudinary.com/c/image/upload/t_x/if_ar_lt_1.78/c_fill,ar_16:9,g_auto/if_end/c_limit,w_3840,h_1080/f_auto,q_auto/v12/d/a.avif'
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

// Runs the inline gate against a stand-in page. `random` stands in for
// Math.random; `last` is the theme the previous visit showed.
function gatePage(
  themes,
  { last, random = 0, bar = DEFAULT_THEME_COLORS.background } = {}
) {
  const properties = {};
  const inserted = [];
  const finished = [];
  const transition = {
    transitionProperty: 'opacity',
    finish: () => finished.push('transition')
  };
  const animation = {
    animationName: 'spin',
    finish: () => finished.push('animation')
  };
  const meta = {
    content: bar,
    cloneNode: () => {
      const node = {
        setAttribute: (name, value) => (node[name] = value)
      };
      return node;
    },
    before: (node) => inserted.push([node.content, node['data-gate']])
  };
  const env = {
    document: {
      documentElement: {
        style: { setProperty: (name, value) => (properties[name] = value) },
        dataset: {},
        getAnimations: () => [transition, animation]
      },
      querySelector: (selector) =>
        selector === 'meta[name="theme-color"]' ? meta : null
    },
    localStorage: {
      getItem: (key) => {
        if (last instanceof Error) throw last;
        return key === 'last-theme' ? (last ?? null) : null;
      }
    },
    Math: { floor: Math.floor, random: () => random }
  };
  new Function(...Object.keys(env), themeGate(themes))(...Object.values(env));
  return {
    properties,
    inserted,
    finished,
    theme: env.document.documentElement.dataset.theme
  };
}

const photo = (name, background) => ({
  url: `https://res.cloudinary.com/c/image/upload/v1/${name}.avif`,
  colors: { primary: '#fff', background }
});

test('themeGate paints a coloured theme other than the last one shown', () => {
  const themes = [photo('a', '#111'), { url: 'x' }, photo('b', '#222')];
  const page = gatePage(themes, { last: themes[0].url });

  expect(page.theme).toBe(2);
  expect(page.properties).toEqual({
    '--color-primary': '#fff',
    '--page-primary': '#fff',
    '--color-background': '#222',
    '--page-background': '#222',
    '--image-background': `url('${landscapeRendition(themes[2].url)}')`,
    '--image-background-portrait': `url('${portraitRendition(themes[2].url)}')`
  });
  expect(page.finished).toEqual(['transition']);
});

test('themeGate picks at random among the rest', () => {
  const themes = [photo('a', '#111'), photo('b', '#222'), photo('c', '#333')];
  expect(gatePage(themes, { random: 0 }).theme).toBe(0);
  expect(gatePage(themes, { random: 0.99 }).theme).toBe(2);
  expect(gatePage(themes, { last: themes[2].url, random: 0.99 }).theme).toBe(1);
});

test('themeGate repeats the only coloured theme, and reads no storage if it must', () => {
  const themes = [photo('a', '#111')];
  expect(gatePage(themes, { last: themes[0].url }).theme).toBe(0);
  expect(gatePage(themes, { last: new Error('blocked') }).theme).toBe(0);
});

test('themeGate leaves the defaults when no theme has colours', () => {
  const page = gatePage([{ url: 'x' }, { url: 'y', colors: null }]);
  expect(page.theme).toBeUndefined();
  expect(page.properties).toEqual({});
  expect(page.inserted).toEqual([]);
  expect(page.finished).toEqual([]);
});

test('themeGate sets the still of a video theme', () => {
  const video = 'https://res.cloudinary.com/c/video/upload/v1/d/a.mp4';
  const page = gatePage([{ url: video, colors: { background: '#000' } }]);
  expect(page.properties['--image-background-still']).toBe(
    `url('${stillRendition(video)}')`
  );
});

test('themeGate puts the bar colour in a stand-in meta, unless the page set its own', () => {
  const themes = [photo('a', '#111')];
  expect(gatePage(themes).inserted).toEqual([['#111', '']]);
  expect(gatePage(themes, { bar: '#abcdef' }).inserted).toEqual([]);
});

test('themeGate escapes markup in theme data', () => {
  const gate = themeGate([{ url: 'https://x/</script>', colors: null }]);
  expect(gate).not.toContain('</script>');
});

test('a Cloudinary video themes the page as a looping animation, six seconds at most', () => {
  const video = 'https://res.cloudinary.com/c/video/upload/v1/d/a.mp4';
  expect(themeRendition(video)).toBe(
    'https://res.cloudinary.com/c/video/upload/so_0,w_200,f_png/v1/d/a.mp4'
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

import { expect, test } from 'bun:test';
import Color from 'color';
import {
  mix,
  ringAccent,
  ringColour,
  shadeFor,
  sharePhoto,
  socialColours
} from './colours';

test('mix is color-mix in srgb: p% of the first colour', () => {
  expect(mix('#ffffff', 0, '#000000')).toBe('#000000');
  expect(mix('#ffffff', 100, '#000000')).toBe('#FFFFFF');
  expect(mix('#ff0000', 22, '#0a0e1a')).toBe(
    Color('#0a0e1a').mix(Color('#ff0000'), 0.22).hex()
  );
});

test('a social takes the site card colours: brand accent, lifted ink for near-black brands', () => {
  const red = socialColours('#ff0000');
  expect(red.accent).toBe('#ff0000');
  expect(red.ink).toBe(mix('#ff0000', 70, '#ffffff'));
  expect(red.ground).toBe(mix('#ff0000', 22, '#0a0e1a'));
  const dark = socialColours('#102913');
  expect(dark.accent).toBe(mix('#102913', 25, '#d3d3d8'));
  expect(dark.ink).toBe(dark.accent);
});

test('the ring accent is at least 35% saturated and 4:1 on the ground', () => {
  const ground = '#0f182d';
  const c = Color(ringAccent('#34566c', ground));
  expect(c.saturationl()).toBeGreaterThanOrEqual(35);
  expect(c.contrast(Color(ground))).toBeGreaterThanOrEqual(4);
  // already loud and light enough: left alone
  expect(ringAccent('#ff6b6b', ground)).toBe(Color('#ff6b6b').hex());
});

const ground = '#0f182d';
const ink = '#eaf6ff';
const bg = Color(ground).rgb().array();
const over = (top, bottom, a) => bottom.map((c, k) => c * (1 - a) + top[k] * a);
const contrast = (text, behind) => Color.rgb(text).contrast(Color.rgb(behind));

test('a dark photo needs no shade; a bright one gets just enough for the title at 7:1', () => {
  const title = { inkAlpha: 1, target: 7 };
  expect(shadeFor([20, 20, 30], ground, ink, title)).toBe(0);
  const a = shadeFor([250, 250, 250], ground, ink, title);
  expect(a).toBeGreaterThan(0.5);
  const behind = over(bg, [250, 250, 250], a);
  expect(contrast(Color(ink).rgb().array(), behind)).toBeGreaterThanOrEqual(
    6.99
  );
});

test('muted text is measured as the colour it lands as, and reaches 4.5:1', () => {
  const muted = { inkAlpha: 0.62, target: 4.5 };
  const text = Color(ink).rgb().array();
  // at 62% the default text reaches 6.8:1 even on the solid ground, so 7:1 is out of reach
  expect(contrast(over(text, bg, 0.62), bg)).toBeLessThan(7);
  expect(shadeFor(bg, ground, ink, { inkAlpha: 0.62, target: 7 })).toBe(1);
  for (const pixel of [
    [128, 128, 128],
    [250, 250, 250]
  ]) {
    const a = shadeFor(pixel, ground, ink, muted);
    const behind = over(bg, pixel, a);
    expect(contrast(over(text, behind, 0.62), behind)).toBeGreaterThanOrEqual(
      4.49
    );
    // more shade than the opaque-ink measure asked for
    expect(a).toBeGreaterThan(
      shadeFor(pixel, ground, ink, { inkAlpha: 1, target: 7 })
    );
  }
});

const photo = (vibrant, dominant) => ({
  asset: {
    url: 'https://cdn.example/p.jpg',
    metadata: {
      palette: {
        vibrant: vibrant && { background: vibrant },
        dominant: dominant && { background: dominant }
      }
    }
  }
});

// A post cover is a Cloudinary image field.
const cloudinaryPhoto = (vibrant) => ({
  _type: 'cloudinaryImage',
  asset: {
    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg'
  },
  palette: { vibrant: { background: vibrant } }
});

test('the card shows the share image, then the cover, then the hero', () => {
  const cover = cloudinaryPhoto('#111111');
  expect(sharePhoto({ sharePhotos: [null, cover, photo('#222222')] })).toBe(
    cover
  );
  const empty = { _type: 'cloudinaryImage', asset: null };
  expect(sharePhoto({ sharePhotos: [null, empty, null] })).toBeNull();
});

test('the ring reads the stored vibrant, then dominant, then the theme primary', () => {
  const theme = { background: '#0f182d', primary: '#ed5f68' };
  expect(ringColour(photo('#34566c', '#aab2c4'), theme)).toBe(
    ringAccent('#34566c', theme.background)
  );
  expect(ringColour(photo(null, '#aab2c4'), theme)).toBe(
    ringAccent('#aab2c4', theme.background)
  );
  expect(ringColour(cloudinaryPhoto('#34566c'), theme)).toBe(
    ringAccent('#34566c', theme.background)
  );
  expect(ringColour(null, theme)).toBe('#ed5f68');
});

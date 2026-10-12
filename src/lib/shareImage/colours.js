import Color from 'color';
import { brandInk } from '@/components/Social';
import { stillOf } from '@/lib/imageBlock';

export const alpha = (hex, a) => Color(hex).alpha(a).rgb().string();

// color-mix(in srgb, a p%, b), which Satori can't parse.
export const mix = (a, p, b) =>
  Color(b)
    .mix(Color(a), p / 100)
    .hex();

const evalColorMix = (css) => {
  const m = css.match(
    /color-mix\(in srgb, (#[0-9a-f]{6}) (\d+)%, (#[0-9a-f]{6})\)/i
  );
  return m ? mix(m[1], Number(m[2]), m[3]) : css;
};

// The site's social card colours: Social.js's brandInk, and Social.module.scss's plate
// (color-mix brand 22% into #0a0e1a) and watermark ink (brand 70% into white). Keep them in step.
export function socialColours(brand) {
  const ink = brandInk(brand);
  const lifted = ink && evalColorMix(ink);
  return {
    accent: lifted ?? brand,
    ink: lifted ?? mix(brand, 70, '#ffffff'),
    ground: mix(brand, 22, '#0a0e1a')
  };
}

// The photo the card shows: a hand-set share image, then the post cover, then the hero.
export const sharePhoto = (page) => page?.sharePhotos?.find(stillOf) ?? null;

// The bold ring: the photo's stored vibrant (or dominant) swatch made loud on the card's
// ground, or the theme primary. The Studio preview's Discord bar reads the same.
export function ringColour(photo, theme) {
  const { vibrant, dominant } = photo?.palette ?? {};
  const swatch = vibrant?.background ?? dominant?.background;
  return swatch ? ringAccent(swatch, theme.background) : theme.primary;
}

// A photo's swatch made loud enough for the bold ring: saturated to at least 35%, lightened to 4:1 on the ground.
export function ringAccent(hex, ground) {
  let c = Color(hex);
  if (c.saturationl() < 35) c = c.saturationl(35);
  const bg = Color(ground);
  for (let i = 0; i < 40 && c.contrast(bg) < 4; i++)
    c = c.lightness(Math.min(92, c.lightness() + 3));
  return c.hex();
}

// Per pixel over a whole photo, so the sRGB-to-luminance maths is inlined rather than built per call through Color.
const linear = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
export const luminance = ([r, g, b]) =>
  0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const over = (top, bottom, a) => bottom.map((c, k) => c * (1 - a) + top[k] * a);

// How opaque the ground has to lie over a pixel for text in `ink` at `inkAlpha` to reach `target`,
// measured against the colour the text really lands as. Compositing is on sRGB values, as Satori's is.
export function shadeFor(pixel, ground, ink, { inkAlpha = 1, target }) {
  const bg = Color(ground).rgb().array();
  const text = Color(ink).rgb().array();
  const reaches = (a) => {
    const behind = over(bg, pixel, a);
    return ratio(over(text, behind, inkAlpha), behind) >= target;
  };
  if (reaches(0)) return 0;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const a = (lo + hi) / 2;
    if (reaches(a)) hi = a;
    else lo = a;
  }
  return hi;
}

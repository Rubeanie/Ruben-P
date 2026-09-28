import { unstable_cache } from 'next/cache';
import {
  clampContrast,
  deriveThemeColorsFromPalette,
  themeRendition
} from './themes';

const cachedThemeFromImage = unstable_cache(
  async (url) => {
    const rendition = themeRendition(url);
    const res = await fetch(rendition, { cache: 'force-cache' });
    const buffer = Buffer.from(await res.arrayBuffer());
    const { Vibrant } = await import('node-vibrant/node');
    const palette = await Vibrant.from(buffer).getPalette();
    const colors = deriveThemeColorsFromPalette(palette);

    return colors ? clampContrast(colors) : null;
  },
  ['image-theme']
);

// Sanity asset urls are immutable per asset, so each image is analysed once per deployment
export async function themeFromImage(url) {
  try {
    return await cachedThemeFromImage(url);
  } catch (error) {
    console.error(`Could not derive theme colors for ${url}`, error);
    return null;
  }
}

const THEME_COLOR_KEYS = {
  primaryColor: 'primary',
  secondaryColor: 'secondary',
  backgroundColor: 'background',
  textColor: 'text'
};

export const themeHasAllColors = (style) =>
  Object.keys(THEME_COLOR_KEYS).every((key) => style[key]);

// A manually set colour wins for its own field; the photo-derived palette only fills the rest.
export const fillThemeColors = (style, colors) =>
  colors
    ? Object.entries(THEME_COLOR_KEYS).reduce(
        (filled, [key, paletteKey]) => ({
          ...filled,
          [key]: style[key] || colors[paletteKey]
        }),
        { ...style }
      )
    : style;

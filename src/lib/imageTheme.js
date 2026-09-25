import { unstable_cache } from 'next/cache';
import { clampContrast, deriveThemeColorsFromPalette } from './themes';

function getRendition(url) {
  const parsed = new URL(url);

  if (parsed.hostname === 'cdn.sanity.io') {
    parsed.searchParams.set('w', '800');
    parsed.searchParams.set('fm', 'jpg');
    parsed.searchParams.set('q', '80');
  }

  return parsed.toString();
}

const cachedThemeFromImage = unstable_cache(
  async (url) => {
    const rendition = getRendition(url);
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

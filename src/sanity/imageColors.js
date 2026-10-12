import { useEffect, useState } from 'react';
import { clampContrast, deriveThemeColorsFromPalette } from '@/lib/themeColors';
import { themeRendition } from '@/lib/themes';

// A style's colour fields and the theme key each fills.
export const COLOR_FIELDS = [
  { key: 'primary', field: 'primaryColor' },
  { key: 'secondary', field: 'secondaryColor' },
  { key: 'background', field: 'backgroundColor' },
  { key: 'text', field: 'textColor' }
];

// The server's theme rule run in the browser: same rendition, palette and maths.
export async function readImageColors(url) {
  const { Vibrant } = await import('node-vibrant/browser');
  const palette = await Vibrant.from(themeRendition(url)).getPalette();
  const colors = deriveThemeColorsFromPalette(palette);
  return colors && clampContrast(colors);
}

export function useImageColors(url) {
  const [read, setRead] = useState({});
  useEffect(() => {
    if (!url) return;
    let live = true;
    readImageColors(url)
      .then((colors) => live && setRead({ url, colors }))
      // A failed analysis leaves the fallback colours, as it does on the site.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [url]);
  return url && read.url === url ? read.colors : null;
}

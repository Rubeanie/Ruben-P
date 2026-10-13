import { expect, test } from 'bun:test';
import Color from 'color';
import {
  clampContrast,
  deriveThemeColorsFromPalette,
  normalizeTheme
} from './themeColors';

const palette = {
  DarkMuted: { hex: '#2b3a55' },
  Vibrant: { hex: '#e0563f' },
  LightVibrant: { hex: '#f2a891' },
  Muted: { hex: '#7a8aa0' }
};

test('deriveThemeColorsFromPalette derives four hex colors from a palette', () => {
  const colors = deriveThemeColorsFromPalette(palette);

  expect(colors).toEqual({
    primary: '#F2A891',
    secondary: '#2D446C',
    background: '#0C182D',
    text: '#CBDBF8'
  });
});

test('a mid-tone accent keeps its colour instead of washing out to white', () => {
  const colors = clampContrast(
    deriveThemeColorsFromPalette({
      DarkMuted: { hex: '#2c3953' },
      LightVibrant: { hex: '#ed5f69' }
    })
  );

  expect(colors.primary).toBe('#ED5F69');
});

test('a very dark photo still gets pale body text, not a mid-tone', () => {
  const colors = deriveThemeColorsFromPalette({
    DarkMuted: { hex: '#1c242c' }
  });

  expect(colors.text).toBe('#C5D9EC');
});

test('a pale photo gets a ground dark enough for its text and buttons', () => {
  const colors = clampContrast(
    deriveThemeColorsFromPalette({
      LightMuted: { hex: '#ffe9c4' },
      LightVibrant: { hex: '#f0b860' }
    })
  );
  const ground = Color(colors.background);

  expect(Color('#ffffff').contrast(ground)).toBeGreaterThanOrEqual(7);
  expect(Color(colors.text).contrast(ground)).toBeGreaterThanOrEqual(4.5);
  expect(Color(colors.primary).contrast(ground)).toBeGreaterThanOrEqual(4.5);
  expect(
    Color(colors.primary).contrast(Color('#121212'))
  ).toBeGreaterThanOrEqual(4.5);
});

const deltaE = (a, b) => {
  const lab = Color(b).lab().array();
  return Math.hypot(
    ...Color(a)
      .lab()
      .array()
      .map((v, i) => v - lab[i])
  );
};

test('a primary that looks like the text gets enough colour to stand apart', () => {
  const colors = clampContrast(
    deriveThemeColorsFromPalette({
      DarkMuted: { hex: '#3a4252' },
      LightVibrant: { hex: '#f4ece8' }
    })
  );

  expect(deltaE(colors.primary, colors.text)).toBeGreaterThan(15);
});

test('a near-black or near-white photo takes on no tint its rounding invents', () => {
  const theme = (key, hex) =>
    clampContrast(deriveThemeColorsFromPalette({ [key]: { hex } }));

  for (const [key, a, b] of [
    ['DarkMuted', '#000000', '#020101'],
    ['LightMuted', '#fcfcfc', '#fdfcfc']
  ]) {
    const [x, y] = [theme(key, a), theme(key, b)];
    for (const name of ['primary', 'background', 'text']) {
      expect(deltaE(x[name], y[name])).toBeLessThan(4);
    }
  }
});

test('a grey accent stays grey when rounding tints it by a step', () => {
  const primary = (hex) =>
    clampContrast(
      deriveThemeColorsFromPalette({
        DarkMuted: { hex: '#3a3a3a' },
        LightVibrant: { hex }
      })
    ).primary;

  expect(deltaE(primary('#d0d0d0'), primary('#d1d0d0'))).toBeLessThan(1.5);
  expect(deltaE(primary('#d0d0d0'), primary('#d0d0d1'))).toBeLessThan(1.5);
});

test('clampContrast keeps the primary readable under dark ink on a near-black ground', () => {
  const colors = clampContrast(
    deriveThemeColorsFromPalette({
      DarkMuted: { hex: '#101010' },
      Muted: { hex: '#737373' }
    })
  );

  expect(
    Color(colors.primary).contrast(Color('#121212'))
  ).toBeGreaterThanOrEqual(4.5);
});

test('clampContrast nudges low-contrast colors up to the threshold', () => {
  const colors = {
    primary: '#40405a',
    secondary: '#33456d',
    background: '#101828',
    text: '#4a4a60'
  };

  const clamped = clampContrast(colors);
  const ground = Color(colors.background);

  expect(Color(clamped.primary).contrast(ground)).toBeGreaterThanOrEqual(4.5);
  expect(Color(clamped.text).contrast(ground)).toBeGreaterThanOrEqual(4.5);
  expect(clamped.background).toBe(colors.background);
  expect(clamped.secondary).toBe(colors.secondary);
});

test('clampContrast leaves already-passing colors unchanged', () => {
  const colors = {
    primary: '#ffffff',
    secondary: '#33456d',
    background: '#101828',
    text: '#ffffff'
  };

  const clamped = clampContrast(colors);

  expect(clamped.primary).toBe(Color(colors.primary).hex());
  expect(clamped.text).toBe(Color(colors.text).hex());
});

test('normalizeTheme turns any colour notation into hex', () => {
  expect(
    normalizeTheme({
      url: 'u',
      primaryColor: 'rgb(255, 0, 0)',
      secondaryColor: '#00f',
      backgroundColor: 'black',
      textColor: '#fff'
    }).colors
  ).toEqual({
    primary: '#FF0000',
    secondary: '#0000FF',
    background: '#000000',
    text: '#FFFFFF'
  });
  expect(normalizeTheme({ url: 'u', primaryColor: '#fff' }).colors).toBe(null);
});

import { expect, test } from 'bun:test';
import Color from 'color';
import { clampContrast, deriveThemeColorsFromPalette } from './themes';

const palette = {
  DarkMuted: { hex: '#2b3a55' },
  Vibrant: { hex: '#e0563f' },
  LightVibrant: { hex: '#f2a891' },
  Muted: { hex: '#7a8aa0' }
};

test('deriveThemeColorsFromPalette derives four hex colors from a palette', () => {
  const colors = deriveThemeColorsFromPalette(palette);

  expect(colors).toEqual({
    primary: '#F7A58C',
    secondary: '#2D446C',
    background: '#0C182D',
    text: '#C9D9F7'
  });
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

import { expect, test } from 'bun:test';
import { fillThemeColors, themeHasAllColors } from './imageTheme';

test('themeHasAllColors is true only when every field is manually set', () => {
  expect(
    themeHasAllColors({
      primaryColor: 'a',
      secondaryColor: 'b',
      backgroundColor: 'c',
      textColor: 'd'
    })
  ).toBe(true);
  expect(themeHasAllColors({ primaryColor: 'a' })).toBe(false);
  expect(themeHasAllColors({})).toBe(false);
});

test('fillThemeColors keeps a manually set colour and fills the rest from the palette', () => {
  const style = { image: 'x', primaryColor: 'manual-primary' };
  const colors = {
    primary: 'photo-primary',
    secondary: 'photo-secondary',
    background: 'photo-background',
    text: 'photo-text'
  };
  expect(fillThemeColors(style, colors)).toEqual({
    image: 'x',
    primaryColor: 'manual-primary',
    secondaryColor: 'photo-secondary',
    backgroundColor: 'photo-background',
    textColor: 'photo-text'
  });
});

test('fillThemeColors returns the style unchanged when no palette was derived', () => {
  const style = { image: 'x' };
  expect(fillThemeColors(style, null)).toBe(style);
});

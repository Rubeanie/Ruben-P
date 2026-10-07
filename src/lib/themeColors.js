import Color from 'color';
import { normalizeThemeDefinition } from './themes';

const ACCENT_SWATCHES = ['LightVibrant', 'Vibrant', 'LightMuted', 'Muted'];
const BASE_SWATCHES = [
  'DarkMuted',
  'DarkVibrant',
  'Muted',
  'Vibrant',
  'LightMuted'
];

function toHex(value) {
  if (!value) {
    return null;
  }

  try {
    return Color(value).hex();
  } catch {
    return null;
  }
}

// A themes query row's four colours as hex; null unless all four are valid.
function normalizeCandidateColors(input) {
  const colors = {
    primary: toHex(input.primaryColor),
    secondary: toHex(input.secondaryColor),
    background: toHex(input.backgroundColor),
    text: toHex(input.textColor)
  };
  return Object.values(colors).every(Boolean) ? colors : null;
}

export const normalizeTheme = (input) =>
  input &&
  normalizeThemeDefinition({
    ...input,
    colors: normalizeCandidateColors(input)
  });

function getSwatchHex(palette, names) {
  for (const name of names) {
    const swatchHex = palette?.[name]?.hex;

    if (swatchHex) {
      return swatchHex;
    }
  }

  return null;
}

export function deriveThemeColorsFromPalette(palette) {
  const baseHex = getSwatchHex(palette, BASE_SWATCHES);

  if (!baseHex) {
    return null;
  }

  try {
    const baseColor = Color(baseHex);
    const accentHex = getSwatchHex(palette, ACCENT_SWATCHES);
    const accentColor = accentHex
      ? Color(accentHex)
      : baseColor.saturate(0.6).lighten(1.35);

    return {
      primary: accentColor.isDark()
        ? accentColor.lighten(1.15).saturate(0.15).hex()
        : accentColor.saturate(0.1).hex(),
      secondary: baseColor.saturate(0.25).lighten(0.2).hex(),
      background: baseColor.saturate(0.75).darken(0.55).hex(),
      text: baseColor.saturate(1.3).lighten(2.5).hex()
    };
  } catch {
    return null;
  }
}

export function clampContrast(colors) {
  const ground = Color(colors.background);
  const direction = ground.isDark() ? 1 : -1;

  const clamp = (hex) => {
    let color = Color(hex);

    for (let step = 0; step < 50 && color.contrast(ground) < 4.5; step += 1) {
      const nextLightness = Math.min(
        100,
        Math.max(0, color.lightness() + direction * 2)
      );
      color = color.lightness(nextLightness);
    }

    return color.hex();
  };

  return {
    ...colors,
    primary: clamp(colors.primary),
    text: clamp(colors.text)
  };
}

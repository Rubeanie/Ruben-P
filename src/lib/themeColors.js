import Color from 'color';
import { INKS } from './posts';
import { normalizeThemeDefinition } from './themes';

const ACCENT_SWATCHES = ['LightVibrant', 'Vibrant', 'LightMuted', 'Muted'];
const BASE_SWATCHES = [
  'DarkMuted',
  'DarkVibrant',
  'Muted',
  'Vibrant',
  'LightMuted'
];
const BLACK = Color('#000');
const WHITE = Color('#fff');

// max(x, floor) with the corner rounded over about ±s, so photos either side of
// the floor shade into each other instead of snapping to it.
const softMax = (x, floor, s) =>
  floor + s * Math.log1p(Math.exp((x - floor) / s));

// Relative luminance for a CIELAB lightness.
const Y = (l) => (l > 8 ? ((l + 16) / 116) ** 3 : l / 903.3);

const lch = (color) => color.lch().array();
const deltaE = (a, b) => {
  const lab = b.lab().array();
  return Math.hypot(
    ...a
      .lab()
      .array()
      .map((v, i) => v - lab[i])
  );
};

// HSL saturation means little near black or white, where a rounding step can
// read as a strong tint, so nothing comes out more than about eight times as
// colourful as the photo's own colour (a smooth min, so no corner). Trimming
// saturation keeps the lightness the caller chose.
const tame = (color, base) => {
  const c = lch(color)[1];
  const cap = 8 * lch(base)[1];
  const kept = c && cap / (c ** 8 + cap ** 8) ** (1 / 8);
  return color.saturationl(color.saturationl() * kept);
};

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
      : tame(baseColor.saturate(0.6).lighten(1.35), baseColor);
    const textColor = baseColor.saturate(1.3).lighten(2.5);
    // A very dark photo would leave the text mid-tone; it eases up to a pale
    // tint instead.
    const text = tame(
      textColor.lightness(softMax(textColor.lightness(), 85, 2)),
      baseColor
    );
    const ground = tame(baseColor.saturate(0.75).darken(0.55), baseColor);
    // A pale photo would leave a mid-tone ground nothing reads on, so its
    // perceived lightness eases to about 32 (white stays above 8:1); scaling
    // toward black keeps its hue.
    const target = -softMax(-ground.l(), -32, 4);
    const scale = ground.l() > 0 ? (Y(target) / Y(ground.l())) ** (1 / 2.2) : 1;
    // A primary that looks like the text gets up to six times its colour,
    // fading out as the two grow apart, so a button still stands out from the
    // words around it. Scaling, not setting, keeps a grey from taking on a hue,
    // and the boost fades in with the colour itself, so a one-step rounding
    // tint (chroma under 1) stays too faint to see.
    const [l, c, h] = lch(accentColor);
    const alike = 1 / (1 + Math.exp((deltaE(accentColor, text) - 12) / 2));
    const boost = 1 + (5 * alike * c * c) / (c * c + 1);

    return {
      // As picked; clampContrast lifts a dark one only as far as it must.
      primary: Color.lch(l, c * boost, h).hex(),
      secondary: tame(baseColor.saturate(0.25).lighten(0.2), baseColor).hex(),
      background: ground.mix(BLACK, 1 - scale).hex(),
      text: text.hex()
    };
  } catch {
    return null;
  }
}

export function clampContrast(colors) {
  // Derived grounds are always dark (perceived lightness eases to about 32),
  // so colours only ever need lifting.
  const ground = Color(colors.background);

  // Blends toward white, which never adds colour (a near-grey stays grey),
  // and only to where it first reads (found by halving), so close inputs
  // stay close.
  const clamp = (hex, grounds) => {
    const at = (amount) => Color(Color(hex).mix(WHITE, amount).hex());
    const reads = (amount) =>
      grounds.every((g) => at(amount).contrast(g) >= 4.5);

    if (reads(0)) return Color(hex).hex();
    let low = 0;
    let high = 1;
    for (let step = 0; step < 20; step += 1) {
      const mid = (low + high) / 2;
      if (reads(mid)) high = mid;
      else low = mid;
    }

    return at(high).hex();
  };

  return {
    ...colors,
    // Buttons and the announcement draw dark ink on the primary, so it
    // lightens until that reads too.
    primary: clamp(colors.primary, [ground, Color(INKS.dark)]),
    text: clamp(colors.text, [ground])
  };
}

import Color from 'color';

export const DEFAULT_THEME_COLORS = {
  primary: '#ed5f68',
  secondary: '#33456d',
  background: '#0f182d',
  text: '#eaf6ff'
};

export const DEFAULT_THEME_URL =
  'https://res.cloudinary.com/ruben-p/image/upload/f_avif,q_30,c_limit,w_800/v1645499430/Images/Backgrounds/paolo-celentano-qMjZUL0_pOw-unsplash_jioifq.webp';

export const DEFAULT_THEME = {
  url: DEFAULT_THEME_URL,
  colors: DEFAULT_THEME_COLORS,
  source: 'default',
  status: 'ready'
};

const COLOR_KEYS = ['primary', 'secondary', 'background', 'text'];
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

function normalizeCandidateColors(input) {
  if (!input) {
    return null;
  }

  const sourceColors =
    input.colors ||
    (COLOR_KEYS.some((key) => input[key])
      ? {
          primary: input.primary,
          secondary: input.secondary,
          background: input.background,
          text: input.text
        }
      : COLOR_KEYS.some((key) => input[`${key}Color`])
        ? {
            primary: input.primaryColor,
            secondary: input.secondaryColor,
            background: input.backgroundColor,
            text: input.textColor
          }
        : null);

  if (!sourceColors) {
    return null;
  }

  const normalizedColors = COLOR_KEYS.reduce((accumulator, key) => {
    const normalizedValue = toHex(sourceColors[key]);

    if (normalizedValue) {
      accumulator[key] = normalizedValue;
    }

    return accumulator;
  }, {});

  return COLOR_KEYS.every((key) => normalizedColors[key])
    ? normalizedColors
    : null;
}

export function normalizeThemeDefinition(input) {
  if (!input) {
    return null;
  }

  if (typeof input === 'string') {
    return {
      url: input,
      colors: null,
      source: 'override'
    };
  }

  const url = input.url || input.image || null;
  const colors = normalizeCandidateColors(input);

  if (!url && !colors) {
    return null;
  }

  return {
    ...input,
    url,
    colors
  };
}

export function pickRandomTheme(themes, currentUrl) {
  const normalizedThemes = (themes || [])
    .map(normalizeThemeDefinition)
    .filter(Boolean);

  if (normalizedThemes.length === 0) {
    return null;
  }

  const nextPool =
    normalizedThemes.length > 1 && currentUrl
      ? normalizedThemes.filter((theme) => theme.url !== currentUrl)
      : normalizedThemes;

  const pool = nextPool.length > 0 ? nextPool : normalizedThemes;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getThemeCacheKey(theme) {
  const normalizedTheme = normalizeThemeDefinition(theme);

  if (!normalizedTheme) {
    return null;
  }

  return JSON.stringify({
    url: normalizedTheme.url,
    colors: normalizedTheme.colors
  });
}

function getThemeImageUrl(url) {
  return `url('${url}')`;
}

export function applyThemeToDocument(theme) {
  if (typeof document === 'undefined' || !theme?.colors) {
    return;
  }

  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });

  document.documentElement.style.setProperty(
    '--image-background',
    getThemeImageUrl(theme.url || DEFAULT_THEME_URL)
  );
}

function getSwatchHex(palette, names) {
  for (const name of names) {
    const swatchHex = palette?.[name]?.hex;

    if (swatchHex) {
      return swatchHex;
    }
  }

  return null;
}

function deriveThemeColorsFromPalette(palette) {
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

export function loadThemeImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = 'anonymous';
    image.decoding = 'async';

    image.onload = () => resolve(image);
    image.onerror = (event) => reject(event);
    image.src = url;
  });
}

async function extractThemeColorsFromImage(image) {
  const { Vibrant } = await import('node-vibrant/browser');
  const palette = await Vibrant.from(image).getPalette();

  return deriveThemeColorsFromPalette(palette);
}

export async function resolveThemeDefinition(theme) {
  const normalizedTheme = normalizeThemeDefinition(theme);

  if (!normalizedTheme) {
    return null;
  }

  if (!normalizedTheme.url) {
    return normalizedTheme.colors
      ? {
          ...normalizedTheme,
          source: normalizedTheme.source || 'custom',
          status: 'ready'
        }
      : null;
  }

  const image = await loadThemeImage(normalizedTheme.url);

  const colors =
    normalizedTheme.colors || (await extractThemeColorsFromImage(image));

  if (!colors) {
    throw new Error(
      `Could not resolve theme colors for ${normalizedTheme.url}`
    );
  }

  return {
    ...normalizedTheme,
    colors,
    source:
      normalizedTheme.source || (normalizedTheme.colors ? 'cms' : 'client'),
    status: 'ready'
  };
}

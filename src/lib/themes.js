import {
  CLOUDINARY_CHAIN,
  THEME_CLIP,
  animatedClip,
  cloudinaryTransform,
  isClip,
  portraitCrop,
  stillFrame,
  videoTransform
} from './imageLoader';

export const DEFAULT_THEME_COLORS = {
  primary: '#ed5f68',
  secondary: '#2f446b',
  background: '#0d182d',
  text: '#ccdbf7'
};

export const DEFAULT_THEME_URL =
  'https://res.cloudinary.com/ruben-p/image/upload/f_avif,q_30,c_limit,w_800/v1645499430/Website/Themes/paolo-celentano-qMjZUL0_pOw-unsplash_jioifq.webp';

export const DEFAULT_THEME = {
  url: DEFAULT_THEME_URL,
  colors: DEFAULT_THEME_COLORS,
  source: 'default',
  status: 'ready'
};

// Colours arrive as hex already: the server normalises them (themeColors.js)
// and a photo read on the device (colorsFromImage) comes out in hex too.
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
  const colors = input.colors || null;

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

// Steps through the list in order; an unknown or missing current starts at the top.
export function nextThemeAfter(themes, currentUrl) {
  if (!themes?.length) return null;
  const index = themes.findIndex((theme) => theme.url === currentUrl);
  return themes[(index + 1) % themes.length];
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

// Android Chrome and desktop tab strips tint from this meta; iOS 26 samples the page instead.
// Only effects call it, so React owns its tag by now and the gate's stand-in goes.
export function setBarColor(value) {
  if (!value) return;
  document.querySelector('meta[name="theme-color"][data-gate]')?.remove();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = value;
}

export function applyThemeToDocument(theme) {
  if (typeof document === 'undefined' || !theme?.colors) {
    return;
  }

  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
    // the page's own theme, published so a hero can blend back to it
    document.documentElement.style.setProperty(`--page-${key}`, value);
  });

  // A hero in charge keeps its own bar colour until it hands back.
  if (!document.querySelector('[data-hero-theme="on"]'))
    setBarColor(theme.colors.background);

  const url = theme.url || DEFAULT_THEME_URL;
  document.documentElement.style.setProperty(
    '--image-background',
    getThemeImageUrl(landscapeRendition(url))
  );
  document.documentElement.style.setProperty(
    '--image-background-portrait',
    getThemeImageUrl(portraitRendition(url))
  );
  const still = stillRendition(url);
  if (still)
    document.documentElement.style.setProperty(
      '--image-background-still',
      getThemeImageUrl(still)
    );
  else
    document.documentElement.style.removeProperty('--image-background-still');
}

// The provider remembers the theme on screen so a reload picks a different one.
export const LAST_THEME_KEY = 'last-theme';

// Runs in <head>, before the first style pass, so the page paints in its theme
// with no fade from the defaults. Mirrors applyThemeToDocument, which cannot be
// imported into a string; the provider adopts the pick from data-theme. The bar
// colour is left alone when the page set its own (a hero's theme); otherwise it
// goes in a stand-in meta ahead of React's (browsers read the first) until
// setBarColor hands over: React hydrates a meta by its content, so editing the
// server one makes React append a second. WebKit can style <html> before this
// runs; the colour fade that starts is finished.
//
// Inlined by its source text, so it stays self-contained and in syntax every
// browser parses as is: no imports, no optional chaining.
function gate(themes, key, defaultBar) {
  const root = document.documentElement;
  const style = root.style;
  let last;
  try {
    last = localStorage.getItem(key);
  } catch {}

  // A theme with colours other than the last one shown, if there is one.
  const coloured = [];
  const fresh = [];
  themes.forEach((theme, index) => {
    if (!theme.colors) return;
    coloured.push(index);
    if (theme.url !== last) fresh.push(index);
  });
  const pool = fresh.length ? fresh : coloured;
  if (!pool.length) return;
  const index = pool[Math.floor(Math.random() * pool.length)];
  const { colors, w: landscape, p: portrait, s: still } = themes[index];

  for (const name in colors) {
    style.setProperty('--color-' + name, colors[name]);
    style.setProperty('--page-' + name, colors[name]);
  }
  style.setProperty('--image-background', `url('${landscape}')`);
  style.setProperty('--image-background-portrait', `url('${portrait}')`);
  if (still) style.setProperty('--image-background-still', `url('${still}')`);

  const bar = document.querySelector('meta[name="theme-color"]');
  if (bar && bar.content === defaultBar) {
    const standIn = bar.cloneNode();
    standIn.content = colors.background;
    standIn.setAttribute('data-gate', '');
    bar.before(standIn);
  }
  root.dataset.theme = index;
  for (const animation of root.getAnimations())
    if (animation.transitionProperty) animation.finish();
}

const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
// Each theme carries its renditions under short keys, to keep the page small.
export const themeGate = (themes) =>
  `(${gate})(${json(
    themes.map(({ url, colors }) => ({
      url,
      colors,
      w: landscapeRendition(url || DEFAULT_THEME_URL),
      p: portraitRendition(url || DEFAULT_THEME_URL),
      s: stillRendition(url || DEFAULT_THEME_URL)
    }))
  )},${json(LAST_THEME_KEY)},${json(DEFAULT_THEME_COLORS.background)})`;

// The server and the Studio analyse the same small PNG of a hero photo. PNG is
// lossless and Vibrant reads every pixel (quality 1, no downscale of its own),
// so both read the same colours.
export function themeRendition(url) {
  // A theme video's colours come from its first frame; an image field's clip
  // comes as its still (stillOf), at the clip's Start.
  if (isClip(url)) return videoTransform(url, 'so_0,w_200,f_png');
  const parsed = new URL(url);

  if (parsed.hostname === 'res.cloudinary.com') {
    // Last in the chain, just before the version, so no named or earlier
    // transform overrides it; Vibrant can't read the AVIF or WebP served
    // otherwise. f_png wins over a video still's .webp too.
    return cloudinaryTransform(url, 'w_200,f_png');
  }

  // The server fetches this, so it reaches nothing but the CDN.
  throw new Error('non-Cloudinary theme image');
}

// On a screen 3:4 or narrower, `cover` shows only the middle 3:4 of a wider
// photo, at full height. A crop to that slice paints the same pixels for less;
// globals.scss swaps it in under the same query. Other hosts keep the original.
export const PORTRAIT_QUERY = '(max-aspect-ratio: 3/4)';

// Sized for the screen that paints it, in the best format the browser takes:
// enough to cover a 1920x1080 screen whatever the photo's shape. A photo
// narrower than 4:3 is cut to 4:3 around its subject first, the tallest any
// screen wider than 3:4 shows; one wider than 16:9 fills by height, keeping
// 1080px of it (up to 3840 wide); any other fills by width. Other hosts keep
// the original.
export function landscapeRendition(url) {
  if (isClip(url))
    return animatedClip(url, 'c_limit,w_1920', { length: THEME_CLIP });
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname === 'res.cloudinary.com') {
    parsed.pathname = parsed.pathname.replace(
      CLOUDINARY_CHAIN,
      '/image/upload/$1if_ar_lt_1.33/c_fill,ar_4:3,g_auto/if_end/if_ar_gt_1.78/c_limit,w_3840,h_1080/if_else/c_limit,w_1920/if_end/f_auto,q_auto/$2'
    );
  }

  return parsed.toString();
}

// A clip's background is an animated WebP; for visitors who ask for reduced
// motion the stylesheet swaps in its first frame (WCAG 2.2.2). Null for a
// still photo, which has nothing to swap.
export function stillRendition(url) {
  return isClip(url)
    ? videoTransform(stillFrame(url), 'c_limit,w_1920,f_auto,q_auto')
    : null;
}

export function portraitRendition(url) {
  // Cloudinary's conditional 3:4 crop is for images, so a video goes whole.
  if (isClip(url)) return landscapeRendition(url);
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname === 'res.cloudinary.com') {
    // The phone hero's cut, sized last like themeRendition.
    return cloudinaryTransform(
      portraitCrop(url),
      'c_limit,h_1600,f_auto,q_auto'
    );
  } else {
    return url;
  }

  return parsed.toString();
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

  // Warm the rendition the stylesheet will pick, so the swap doesn't flash.
  const image = await loadThemeImage(
    (matchMedia('(prefers-reduced-motion: reduce)').matches &&
      stillRendition(normalizedTheme.url)) ||
      (matchMedia(PORTRAIT_QUERY).matches
        ? portraitRendition(normalizedTheme.url)
        : landscapeRendition(normalizedTheme.url))
  );

  // A bare URL (overrideTheme in the console) reads its colours here.
  const colors = normalizedTheme.colors ?? (await colorsFromImage(image));
  if (!colors) {
    throw new Error(
      `Could not resolve theme colors for ${normalizedTheme.url}`
    );
  }

  return {
    ...normalizedTheme,
    colors,
    source: normalizedTheme.source || 'cms',
    status: 'ready'
  };
}

// Read on the device from a decoded image, through the same derivation as the
// server, in hex; null for a flat or tiny picture with no palette.
export async function colorsFromImage(image) {
  const [{ Vibrant }, { clampContrast, deriveThemeColorsFromPalette }] =
    await Promise.all([
      import('node-vibrant/browser'),
      import('./themeColors')
    ]);
  const palette = await Vibrant.from(image).maxDimension(800).getPalette();
  const colors = deriveThemeColorsFromPalette(palette);
  return colors && clampContrast(colors);
}

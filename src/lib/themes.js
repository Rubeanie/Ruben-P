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

// Colours arrive as hex already: the server normalises them (themeColors.js)
// and a visitor's photo is derived in hex, so the browser needs no colour maths.
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

  document.documentElement.style.setProperty(
    '--image-background',
    getThemeImageUrl(theme.url || DEFAULT_THEME_URL)
  );
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
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
export const themeGate = (themes) =>
  `(function(t,k,u,g){var e=document.documentElement,s=e.style,l,a=[],b=[];try{l=localStorage.getItem(k)}catch(_){}t.forEach(function(p,i){if(p.colors){a.push(i);if(p.url!==l)b.push(i)}});b=b.length?b:a;if(!b.length)return;var i=b[Math.floor(Math.random()*b.length)],c=t[i].colors,m=document.querySelector('meta[name="theme-color"]');for(var n in c){s.setProperty('--color-'+n,c[n]);s.setProperty('--page-'+n,c[n])}s.setProperty('--image-background',"url('"+(t[i].url||u)+"')");if(m&&m.content===g){var f=m.cloneNode();f.content=c.background;f.setAttribute('data-gate','');m.before(f)}e.dataset.theme=i;e.getAnimations().forEach(function(a){if(a.transitionProperty)a.finish()})})(${json(
    themes.map(({ url, colors }) => ({ url, colors }))
  )},${json(LAST_THEME_KEY)},${json(DEFAULT_THEME_URL)},${json(DEFAULT_THEME_COLORS.background)})`;

// The server and the Studio analyse the same small JPG of a hero photo.
export function themeRendition(url) {
  const parsed = new URL(url);

  if (parsed.hostname === 'cdn.sanity.io') {
    parsed.searchParams.set('w', '800');
    parsed.searchParams.set('fm', 'jpg');
    parsed.searchParams.set('q', '80');
  } else if (parsed.hostname === 'res.cloudinary.com') {
    // Last in the chain, just before the version, so no named or earlier
    // transform overrides it; Vibrant can't read the AVIF or WebP served otherwise.
    parsed.pathname = parsed.pathname.replace(
      CLOUDINARY_CHAIN,
      '/image/upload/$1w_800,f_jpg,q_80/$2'
    );
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

  await loadThemeImage(normalizedTheme.url);

  if (!normalizedTheme.colors) {
    throw new Error(
      `Could not resolve theme colors for ${normalizedTheme.url}`
    );
  }

  return {
    ...normalizedTheme,
    source: normalizedTheme.source || 'cms',
    status: 'ready'
  };
}

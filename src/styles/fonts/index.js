import localFont from 'next/font/local';

export const mont = localFont({
  src: [
    {
      path: './trt/trt-mont-broz-regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './trt/trt-mont-broz-extra-light.woff2',
      weight: '200',
      style: 'normal'
    },
    { path: './trt/trt-mont-broz-light.woff2', weight: '300', style: 'normal' },
    {
      path: './trt/trt-mont-broz-extra-bold.woff2',
      weight: '800',
      style: 'normal'
    }
  ],
  variable: '--font-mont',
  display: 'swap',
  preload: false,
  // Its Verdana stand-ins are in globals.scss: Next only offers one Arial or
  // Times face for every weight.
  adjustFontFallback: false,
  // Mont's 800/300 win metrics leave 150 more units below caps than above, so
  // caps sit high in the line box. Rebalanced around the 650 cap height; the
  // total stays 1100 so line boxes keep their size. Next only takes literals
  // here, so montCritical and the stand-ins in globals.scss repeat it.
  declarations: [
    { prop: 'ascent-override', value: '87.5%' },
    { prop: 'descent-override', value: '22.5%' },
    { prop: 'line-gap-override', value: '0%' }
  ]
});

// Figtree 2.002 from google/fonts; its ss02 (barred I, tailed l; the slashed zero removed) is the default, so
// fallback fonts never see the feature: Windows Arial's ss02 is a unicase set.
export const figtree = localFont({
  src: [
    { path: './figtree/figtree.woff2', weight: '300 900', style: 'normal' }
  ],
  variable: '--font-figtree',
  display: 'swap',
  preload: true,
  // Its per-weight Arial stand-ins are in globals.scss.
  adjustFontFallback: false
});

// JetBrains Mono 2.211 from google/fonts, upright only: the code theme sets
// nothing in italic. Only code blocks use it, so no preload.
export const jetbrainsMono = localFont({
  src: './jetbrains-mono/jetbrains-mono.woff2',
  weight: '100 800',
  variable: '--font-mono',
  display: 'swap',
  preload: false,
  adjustFontFallback: false
});

// The weights headings use, preloaded so they replace their stand-ins as early
// as possible: on a slow first visit the swap still lands after first paint.
// Same family as above.
export const montCritical = localFont({
  src: [
    {
      path: './trt/trt-mont-broz-medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './trt/trt-mont-broz-semi-bold.woff2',
      weight: '600',
      style: 'normal'
    },
    { path: './trt/trt-mont-broz-bold.woff2', weight: '700', style: 'normal' }
  ],
  variable: '--font-mont-critical',
  display: 'swap',
  preload: true,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'mont' },
    { prop: 'ascent-override', value: '87.5%' },
    { prop: 'descent-override', value: '22.5%' },
    { prop: 'line-gap-override', value: '0%' }
  ]
});

// Keep italic available on demand, without a site-wide preload.
export const figtreeItalic = localFont({
  src: './figtree/figtree-italic.woff2',
  weight: '300 900',
  style: 'italic',
  variable: '--font-figtree-italic',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'figtree' }]
});

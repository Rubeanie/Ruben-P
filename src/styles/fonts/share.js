import localFont from 'next/font/local';

// Stand-ins for gg sans and Slack-Lato in the Studio's share previews, served
// locally so a build never waits on Google Fonts.
export const notoSans = localFont({
  src: [
    { path: './noto-sans/noto-sans-latin-400.woff2', weight: '400' },
    { path: './noto-sans/noto-sans-latin-500.woff2', weight: '500' },
    { path: './noto-sans/noto-sans-latin-600.woff2', weight: '600' }
  ],
  variable: '--font-noto-sans',
  preload: false
});

export const lato = localFont({
  src: [
    { path: './lato/lato-latin-400.woff2', weight: '400' },
    { path: './lato/lato-latin-700.woff2', weight: '700' },
    { path: './lato/lato-latin-900.woff2', weight: '900' }
  ],
  variable: '--font-lato',
  preload: false
});

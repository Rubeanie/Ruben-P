import localFont from 'next/font/local';

export const yapari = localFont({
  src: './yapari-webfont.woff2',
  variable: '--font-yapari',
  display: 'swap',
  style: 'normal',
  weight: '750',
  preload: true
});

export const kollektif = localFont({
  src: './kollektif-webfont.woff2',
  variable: '--font-kollektif',
  display: 'swap',
  style: 'normal',
  weight: '400',
  preload: true
});

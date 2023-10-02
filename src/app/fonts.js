import localFont from 'next/font/local';

export const yapari = localFont({
  src: './fonts/yapari-variable.ttf',
  variable: '--font-yapari',
  display: 'swap',
  style: 'normal',
  weight: '750',
  preload: true
});

export const kollektif = localFont({
  src: './fonts/kollektif-webfont.ttf',
  variable: '--font-kollektif',
  display: 'swap',
  style: 'normal',
  preload: true
});

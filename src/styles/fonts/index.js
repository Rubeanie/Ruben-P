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
      path: './trt/trt-mont-broz-medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './trt/trt-mont-broz-semi-bold.woff2',
      weight: '600',
      style: 'normal'
    },
    { path: './trt/trt-mont-broz-bold.woff2', weight: '700', style: 'normal' },
    {
      path: './trt/trt-mont-broz-extra-bold.woff2',
      weight: '800',
      style: 'normal'
    }
  ],
  variable: '--font-mont',
  display: 'swap',
  preload: true
});

export const kollektif = localFont({
  src: [
    {
      path: './kollektif/kollektif-regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './kollektif/kollektif-italic.woff2',
      weight: '400',
      style: 'italic'
    }
  ],
  variable: '--font-kollektif',
  display: 'swap',
  preload: true
});

import '@/styles/globals.scss';
import { mont, kollektif } from '@/styles/fonts';
import Signature from '@/components/Signature';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeContext';
import { getThemes } from '@/lib/sanity/queries';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VisualEditingControls } from '@/components/VisualEditingControls';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { baseUrl } from '@/lib/env';

export const metadata = {
  metadataBase: new URL(baseUrl),
  keywords: [
    'Ruben',
    'Panzich',
    'Rubeanie',
    'Portfolio',
    'About',
    'Links',
    'Contact',
    'Artist',
    'Developer'
  ],
  authors: [{ name: 'Ruben Panzich', url: 'https://www.ruben-p.com' }],
  other: {
    'darkreader-lock': true
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
//  maximumScale: 1,
//  userScalable: 'no',
  themeColor: '#121212',
  colorScheme: 'dark',
  viewportFit: 'cover',
  interactiveWidget: 'overlays-content'
};

export default async function RootLayout({ children }) {
  const themes = await getThemes();
  return (
    <html lang='en' className={`${mont.variable} ${kollektif.variable}`}>
      <head>
        <link
          rel='preload'
          href='https://www.gstatic.com/draco/versioned/decoders/1.5.5/draco_wasm_wrapper.js'
          as='fetch'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          href='https://www.gstatic.com/draco/versioned/decoders/1.5.5/draco_decoder.wasm'
          as='fetch'
          crossOrigin='anonymous'
        />
        <link rel='preconnect' href='https://www.gstatic.com' />
        <link rel='preconnect' href='https://api.sanity.com' />
        <link rel='preconnect' href='https://cdn.sanity.io' />
        <link rel='preconnect' href='https://res.cloudinary.com' />
      </head>
      <body>
        <ThemeProvider initialThemes={themes}>
          <Suspense>
            <Signature />
          </Suspense>
          <Suspense>
            <Navbar />
          </Suspense>
          <Suspense>
            <main>{children}</main>
          </Suspense>
          <Suspense fallback={<div>Loading Footer...</div>}>
            <Footer />
          </Suspense>
          <Analytics />
          <SpeedInsights />
          <VisualEditingControls />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

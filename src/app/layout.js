import '@/styles/globals.scss';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Signature from '@/components/Signature';
import { Suspense } from 'react';
import { Theme } from '@/utils/themes';
import { getThemeUrl } from '@/utils/sanity';
import { yapari, kollektif } from '@/styles/fonts';
import { Analytics } from '@vercel/analytics/react';
import { Preload } from './preload';
import { Layout } from '@/components/dom/Layout';

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(baseUrl),
  keywords: ['Ruben', 'Panzich', 'Rubeanie', 'Portfolio', 'About', 'Links', 'Contact', 'Artist', 'Developer'],
  authors: [{ name: 'Ruben Panzich', url: 'https://www.ruben-p.com' }],
  other: {
    "darkreader-lock": true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#121212',
  colorScheme: 'dark',
  viewportFit: 'cover',
  interactiveWidget: 'overlays-content'
}

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}) {
  const data = await getThemeUrl();
  return (
    <html lang='en' className={`${yapari.variable} ${kollektif.variable}`}>
      <body>
        <div className='background-image' />
        <Preload />
        <Signature />
        <Navbar />
        <Suspense>
          <main>
            <Layout>
              {children}
            </Layout>
          </main>
        </Suspense>
        <Theme url={data} />
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

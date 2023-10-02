import '../styles/globals.scss';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Theme from './_themes/page';
import { yapari, kollektif } from './fonts';
import Signature from '../components/Signature';
import { useColor, useBackgroundColor, UpdateMetadata } from './_themes/themes';
import { Analytics } from '@vercel/analytics/react';
import DynamicMetadata from './client';

export const metadata = {
  keywords: ['Ruben', 'Panzich', 'Rubeanie', 'Portfolio', 'About', 'Links', 'Contact', 'Artist', 'Developer'],
  authors: [{ name: 'Ruben Panzich', url: 'https://www.ruben-p.com' }],
  colorScheme: 'dark',
  themeColor: '#0f182d',
  icons: {
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon/safari-pinned-tab.svg',
        color: '#ed5f68',
      },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover'
  },
  other: {
    "darkreader-lock": true,
  },
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}) {
  return (
    <html lang='en' className={`${yapari.variable} ${kollektif.variable}`}>
      <body>
        <div className='background-image' />
        <Signature />
        <Navbar />
        {children}
        <Theme />
        <Footer />
        <DynamicMetadata />
        <Analytics />
      </body>
    </html>
  );
}

import '../styles/globals.scss';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
//import { Theme } from '../lib/themes';
//import { getThemeUrl } from '../lib/sanity';
import { yapari, kollektif } from '../styles/fonts';
/* import Signature from '../components/Signature'; */
import { Analytics } from '@vercel/analytics/react';
/* import DynamicMetadata from './metadata'; */

export const metadata = {
  keywords: ['Ruben', 'Panzich', 'Rubeanie', 'Portfolio', 'About', 'Links', 'Contact', 'Artist', 'Developer'],
  authors: [{ name: 'Ruben Panzich', url: 'https://www.ruben-p.com' }],
  colorScheme: 'dark',
  themeColor: '#0f182d',
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

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}) {
//  const data = await getThemeUrl();
  return (
    <html lang='en' className={`${yapari.variable} ${kollektif.variable}`}>
      <body>
        <div className='background-image' />
        {/* <Signature /> */}
        <Navbar />
        {children}
        {/* <Theme url={data} /> */}
        <Footer />
        {/* <DynamicMetadata /> */}
        <Analytics />
      </body>
    </html>
  );
}

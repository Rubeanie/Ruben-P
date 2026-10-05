import '@/styles/globals.scss';
import {
  mont,
  figtree,
  jetbrainsMono,
  montCritical,
  figtreeItalic
} from '@/styles/fonts';
import Signature from '@/components/Signature';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Announcement from '@/components/Announcement';
import { ThemeProvider } from '@/components/ThemeContext';
import { SiteLogo } from '@/components/SiteLogo';
import { getSite, getThemes } from '@/lib/sanity/queries';
import { introImages, menuHrefs } from '@/lib/introImages';
import IntentImages from '@/components/IntentImages';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VisualEditingControls } from '@/components/VisualEditingControls';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { baseUrl } from '@/lib/env';
import { stegaClean } from '@sanity/client/stega';
import { sanitizeLogo } from '@/lib/cachedLogo';
import { DEFAULT_THEME_COLORS, themeGate } from '@/lib/themes';
import { normalizeTheme } from '@/lib/themeColors';
import { liveAnnouncement } from '@/lib/announcement';
import { resolveLink } from '@/lib/processUrl';
import { navLinks } from '@/lib/navLinks';
import { feedTypes } from '@/lib/resolveMetadata';
import { navGate } from '@/lib/navGate';

export async function generateMetadata() {
  const { author } = await getSite();
  const name = stegaClean(author?.name);
  const link = resolveLink(author?.link);
  return {
    metadataBase: new URL(baseUrl),
    authors: [{ name, url: link ? new URL(link, baseUrl).href : undefined }],
    alternates: { types: feedTypes },
    other: {
      'darkreader-lock': true
    }
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  //  maximumScale: 1,
  //  userScalable: 'no',
  themeColor: DEFAULT_THEME_COLORS.background,
  colorScheme: 'dark',
  viewportFit: 'cover',
  interactiveWidget: 'overlays-content'
};

// The menu's destinations, warmed when a visitor reaches for a link. Streamed
// so the lookup never holds up the page.
async function MenuIntent({ site }) {
  const hrefs = menuHrefs(site.headerMenu, site.footerMenu);
  return <IntentImages images={await introImages(hrefs)} />;
}

export default async function RootLayout({ children }) {
  const [themes, site] = await Promise.all([getThemes(), getSite()]);
  const normalisedThemes = themes.map(normalizeTheme).filter(Boolean);
  const logo = await sanitizeLogo(stegaClean(site.logo));
  return (
    // The announcement's inline script may flag <html> before hydration.
    <html
      lang='en'
      suppressHydrationWarning
      data-scroll-behavior='smooth'
      className={`${mont.variable} ${figtree.variable} ${jetbrainsMono.variable} ${montCritical.variable} ${figtreeItalic.variable}`}>
      <head>
        <link rel='preconnect' href='https://cdn.sanity.io' />
        <link rel='preconnect' href='https://res.cloudinary.com' />
        <script
          dangerouslySetInnerHTML={{
            __html: themeGate(normalisedThemes)
          }}
        />
      </head>
      <body>
        <Announcement
          announcement={liveAnnouncement(site.announcements)}
          logo={logo}
        />
        <ThemeProvider initialThemes={normalisedThemes}>
          <Suspense>
            <Signature />
          </Suspense>
          {/* Outside a Suspense boundary: streamed later, the gate would measure
              a hidden bar and the page would paint without it. */}
          <Navbar {...navLinks(site.headerMenu)} logo={logo} />
          <Suspense fallback={null}>
            <MenuIntent site={site} />
          </Suspense>
          <script dangerouslySetInnerHTML={{ __html: navGate }} />
          <main>
            <SiteLogo logo={logo}>{children}</SiteLogo>
          </main>
          <Footer
            menu={site.footerMenu}
            logo={logo}
            author={site.author?.name}
          />
          <Analytics />
          <SpeedInsights />
          <VisualEditingControls />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

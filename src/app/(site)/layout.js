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
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VisualEditingControls } from '@/components/VisualEditingControls';
import { SanityLive } from '@/lib/sanity/live';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { baseUrl } from '@/lib/env';
import { stegaClean } from '@sanity/client/stega';
import { sanitizeSvg } from '@/lib/sanitizeSvg';
import {
  DEFAULT_THEME_COLORS,
  normalizeThemeDefinition,
  themeGate
} from '@/lib/themes';
import { liveAnnouncement } from '@/lib/announcement';
import { resolveLink } from '@/lib/processUrl';
import { feedTypes } from '@/lib/resolveMetadata';

// Runs right after the navbar markup, before first paint: sets the compact state
// the Navbar keeps current, so a phone never paints the full bar first. Measuring
// gives the bar a style to transition from, so the docking it starts is finished.
// The band above has just matched too, and WebKit would glide <html>'s
// --announce-height in from 0, so <html>'s own transitions are finished as well.
const navGate =
  "var d=document.documentElement,l=document.querySelector('[data-nav-links]'),f=function(e,o){e.getAnimations(o).forEach(function(a){if(a.transitionProperty)a.finish()})};if(l&&l.scrollWidth>l.clientWidth){d.setAttribute('data-nav-compact','');f(l.closest('nav'),{subtree:true})}f(d)";

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

export default async function RootLayout({ children }) {
  const [themes, site] = await Promise.all([getThemes(), getSite()]);
  const logo = sanitizeSvg(stegaClean(site.logo));
  return (
    // The announcement's inline script may flag <html> before hydration.
    <html
      lang='en'
      suppressHydrationWarning
      data-scroll-behavior='smooth'
      className={`${mont.variable} ${figtree.variable} ${jetbrainsMono.variable} ${montCritical.variable} ${figtreeItalic.variable}`}>
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
        <link rel='preconnect' href='https://cdn.sanity.io' />
        <link rel='preconnect' href='https://res.cloudinary.com' />
        <script
          dangerouslySetInnerHTML={{
            __html: themeGate(
              themes.map(normalizeThemeDefinition).filter(Boolean)
            )
          }}
        />
      </head>
      <body>
        <Announcement
          announcement={liveAnnouncement(site.announcements)}
          logo={logo}
        />
        <ThemeProvider initialThemes={themes}>
          <Suspense>
            <Signature />
          </Suspense>
          {/* Outside a Suspense boundary: streamed later, the gate would measure
              a hidden bar and the page would paint without it. */}
          <Navbar menu={site.headerMenu} logo={logo} />
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
          <SanityLive />
          <VisualEditingControls />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

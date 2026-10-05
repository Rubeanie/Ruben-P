import { stegaClean } from '@sanity/client/stega';
import { getSite } from '@/lib/sanity/queries';

export default async function manifest() {
  const site = await getSite();
  const title = stegaClean(site.title);
  return {
    name: title,
    short_name: stegaClean(site.alternateName) || title,
    description: stegaClean(site.seo?.metaDescription),
    start_url: '/',
    display: 'standalone',
    background_color: '#0f182d',
    theme_color: '#0f182d',
    icons: [
      {
        src: '/pwa/PWA-192x192.png',
        sizes: '  192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa/PWA-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa/maskable-PWA-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/pwa/maskable-PWA-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}

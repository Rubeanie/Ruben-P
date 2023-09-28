export default function manifest() {
  return {
    name: 'Ruben-P.com',
    short_name: 'Ruben',
    description: "Ruben Panzich's website",
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

/** @type {import('next').NextConfig} */

const path = require('path');
const { DISCORD_SEGMENT } = require('./src/lib/shareImage/discord.cjs');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled:
    process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'production'
});

const nextConfig = {
  // Extra hosts allowed to reach the dev server (e.g. a phone on the LAN), comma-separated
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(','),
  // Inline the (tiny) CSS chunks as <style> in <head> so they leave the
  // critical request chain — Turbopack-native replacement for optimizeCss.
  experimental: {
    inlineCss: true
  },
  images: {
    // CMS image URLs never change at a URL (a new upload gets a new one), so a month is safe;
    // the default is 4 hours.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' }
    ]
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  },
  async headers() {
    // No CSP or frame blocking: the Sanity Presentation tool frames the site.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ];
  },
  async redirects() {
    return [
      // Next otherwise serves the home page at /index too, as a second URL for it.
      { source: '/index', destination: '/', permanent: true },
      // The Discord variant below is only reached by the rewrite, which runs after
      // redirects; asked for directly it goes back to the page itself.
      { source: `/${DISCORD_SEGMENT}`, destination: '/', permanent: false },
      {
        source: `/${DISCORD_SEGMENT}/:path+`,
        destination: '/:path+',
        permanent: false
      }
    ];
  },
  async rewrites() {
    // Discord colours its embed bar from theme-color, so its crawler gets the
    // page variant whose theme-color is the share card's ring. Files, the card
    // route and the Studio are left alone.
    return {
      beforeFiles: [
        {
          source: '/:path((?!og(?:/|$)|api/|admin|_next/)[^.]*)',
          has: [{ type: 'header', key: 'user-agent', value: '.*Discordbot.*' }],
          destination: `/${DISCORD_SEGMENT}/:path`
        }
      ]
    };
  }
};

module.exports = withBundleAnalyzer(nextConfig);

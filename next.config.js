/** @type {import('next').NextConfig} */

const path = require('path');

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
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' }
    ]
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }
};

module.exports = withBundleAnalyzer(nextConfig);

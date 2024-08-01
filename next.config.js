/** @type {import('next').NextConfig} */

const path = require('path');

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: ["app-build-manifest.json"],
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled:
    process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'production'
});

const nextConfig = {
  /* images: {
    domains: ['res.cloudinary.com']
  }, */
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  },
  experimental: {
    urlImports: ['https://themer.sanity.build/', 'https://res.cloudinary.com/']
  }
};

module.exports = withBundleAnalyzer(withPWA(nextConfig))
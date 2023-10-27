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
  images: {
    domains: ['res.cloudinary.com']
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3333/admin/:path*'
            : '/admin/index.html'
      }
    ];
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig))
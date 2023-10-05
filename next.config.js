/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled:
    process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'production'
});

module.exports = withBundleAnalyzer(
  withPWA({
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
    images: {
      domains: ['res.cloudinary.com']
    }
  })
);
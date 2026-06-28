/** @type {import('next').NextConfig} */

const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled:
    process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'production'
});

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ]
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }
};

module.exports = withBundleAnalyzer(nextConfig);

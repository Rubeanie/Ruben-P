const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(
  withPWA({
    swcMinify: true,
    transpilePackages: ['@acme/ui', 'lodash-es'],
    modularizeImports: {
      'react-bootstrap': {
        transform: 'react-bootstrap/{{member}}',
      },
      lodash: {
        transform: 'lodash/{{member}}',
        preventFullImport: true,
      },
    },
    async rewrites() {
      return [
        {
          source: "/admin/:path*",
          destination:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3333/admin/:path*"
              : "/admin/index.html",
        },
      ];
    },
    i18n: {
      locales: ["en"],
      defaultLocale: "en",
    },
    reactStrictMode: true,
    images: {
      domains: ["res.cloudinary.com"],
    },
  })
);

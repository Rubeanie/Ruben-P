const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
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
  reactStrictMode: false,
  images: {
    domains: ["res.cloudinary.com"],
  },
});

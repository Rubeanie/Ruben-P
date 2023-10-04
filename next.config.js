const path = require("path");

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled:
    process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'production'
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  scope: '/src/app',
  buildExcludes: ["app-build-manifest.json"]
});

const generateAppDirEntry = (entry) => {
  const packagePath = require.resolve('next-pwa');
  const packageDirectory = path.dirname(packagePath);
  const registerJs = path.join(packageDirectory, "register.js");

  return entry().then((entries) => {
    if (entries["main-app"] && !entries["main-app"].includes(registerJs)) {
      if (Array.isArray(entries["main-app"])) {
        entries["main-app"].unshift(registerJs);
      } else if (typeof entries["main-app"] === "string") {
        entries["main-app"] = [registerJs, entries["main-app"]];
      }
    }
    return entries;
  });
};

const nextConfig = {
  swcMinify: true,
  transpilePackages: ['@acme/ui', 'lodash-es'],
  modularizeImports: {
    'react-bootstrap': {
      transform: 'react-bootstrap/{{member}}'
    },
    lodash: {
      transform: 'lodash/{{member}}',
      preventFullImport: true
    }
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
  i18n: {
    locales: ['en'],
    defaultLocale: 'en'
  },
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com']
  },
  webpack: (config) => {
    const entry = generateAppDirEntry(config.entry);
    config.entry = () => entry;

    return config;
  },
};

const KEYS_TO_OMIT = [
  'webpackDevMiddleware',
  'configOrigin',
  'target',
  'analyticsId',
  'webpack5',
  'amp',
  'assetPrefix'
];

module.exports = (_phase, { defaultConfig }) => {
  const plugins = [[withPWA], [withBundleAnalyzer, {}]];

  const wConfig = plugins.reduce(
    (acc, [plugin, config]) => plugin({ ...acc, ...config }),
    {
      ...defaultConfig,
      ...nextConfig
    }
  );

  const finalConfig = {};
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key];
    }
  });

  return finalConfig;
};

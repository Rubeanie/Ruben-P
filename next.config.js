module.exports = {
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
};

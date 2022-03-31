const STUDIO_REWRITE = {
  source: "/admin/:path*",
  destination:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3333/admin/:path*"
      : "/admin/index.html",
};

module.exports = {
  rewrites: () => [STUDIO_REWRITE],
  rewrites: async () => {
    return [
      {
        source: "/admin/:path*",
        destination: "/admin/index.html",
      },
    ];
  },
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
};

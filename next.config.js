const STUDIO_REWRITE = {
  source: "/admin/:path*",
  destination:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3333/admin/:path*"
      : "/admin/:path*",
};

module.exports = {
  rewrites: () => [STUDIO_REWRITE],
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
};

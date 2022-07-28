module.exports = {
  rewrites: async () => {
    return [
      {
        source: "/admin/:path*",
        destination:
        process.env.NODE_ENV === "development"
        ? "http://localhost:3333/admin/:path*"
        : "/admin/index.html",
      }
    ]
  },
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
};

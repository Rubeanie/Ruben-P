export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/404'
    },
    sitemap: 'https://www.ruben-p.com/sitemap.xml'
  };
}

/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ruben-p.com',
  changefreq: 'daily',
  generateRobotsTxt: true,
  transform: async (config, path) => {
    let priorityOffset = 0;
    if (path.split('/').length == 2 && path.split('/')[1] != '') {
      priorityOffset = 0.05;
    }
    // Use default transformation for all other cases
    return {
      loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: (
        (100 - (path.split('/').length - 2) * 10) / 100 -
        priorityOffset
      ).toFixed(2),
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? []
    };
  }
};

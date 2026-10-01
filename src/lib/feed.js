export const FEED_PATH = '/feed.xml';

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
};
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ENTITIES[c]);

const item = (post, baseUrl) => {
  const link = escape(baseUrl + post.slug);
  const { cover } = post;
  return [
    '<item>',
    `<title>${escape(post.title)}</title>`,
    `<link>${link}</link>`,
    `<guid isPermaLink="true">${link}</guid>`,
    post.summary && `<description>${escape(post.summary)}</description>`,
    `<pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>`,
    ...(post.categories ?? []).map((c) => `<category>${escape(c)}</category>`),
    cover?.url &&
      `<enclosure url="${escape(cover.url)}" length="${cover.size ?? 0}" type="${escape(cover.mimeType)}"/>`,
    '</item>'
  ]
    .filter(Boolean)
    .join('');
};

// Posts arrive already filtered and ordered.
export const rssXml = ({ site, posts, baseUrl }) =>
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
  `<title>${escape(site.title)}</title>` +
  `<link>${escape(baseUrl)}</link>` +
  `<description>${escape(site.description || site.title)}</description>` +
  '<language>en</language>' +
  `<atom:link href="${escape(baseUrl + FEED_PATH)}" rel="self" type="application/rss+xml"/>` +
  posts.map((p) => item(p, baseUrl)).join('') +
  '</channel></rss>';

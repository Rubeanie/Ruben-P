import { resolveImage } from '@/lib/imageBlock';

export const FEED_PATH = '/feed.xml';

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
};
// XML 1.0 rejects most control characters even escaped, so drop them.
const escape = (s) =>
  String(s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[&<>"']/g, (c) => ENTITIES[c]);

// The cover's still: its type from the URL's extension, and its length known
// only for an image served as uploaded (0 tells readers it's unknown).
function enclosure(value) {
  const cover = resolveImage(value);
  if (!cover) return null;
  const ext = cover.still.match(/\.(\w+)(?:\?|$)/)?.[1].toLowerCase();
  const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const exact = !cover.moving && cover.src === value.asset.secure_url;
  const length = (exact && value.asset.bytes) || 0;
  return `<enclosure url="${escape(cover.still)}" length="${length}" type="${escape(type)}"/>`;
}

const item = (post, baseUrl) => {
  const link = escape(baseUrl + post.slug);
  return [
    '<item>',
    `<title>${escape(post.title)}</title>`,
    `<link>${link}</link>`,
    `<guid isPermaLink="true">${link}</guid>`,
    post.summary && `<description>${escape(post.summary)}</description>`,
    `<pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>`,
    ...(post.categories ?? []).map((c) => `<category>${escape(c)}</category>`),
    enclosure(post.cover),
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

import { expect, test } from 'bun:test';
import { rssXml } from './feed';

const baseUrl = 'https://example.com';
const site = { title: 'Ruben & Co', description: null };
const post = {
  title: `A <b> "quoted" & 'odd' post`,
  slug: '/blog/a',
  summary: 'Short',
  publishDate: '2026-09-27T15:58:45Z',
  categories: ['Art', 'Code'],
  cover: {
    asset: {
      secure_url:
        'https://res.cloudinary.com/demo/image/upload/v1/a.png?x=1&y=2',
      bytes: 42
    }
  }
};

test('escapes markup characters in text and attributes', () => {
  const xml = rssXml({ site, posts: [post], baseUrl });
  expect(xml).toContain('<title>Ruben &amp; Co</title>');
  expect(xml).toContain(
    '<title>A &lt;b&gt; &quot;quoted&quot; &amp; &apos;odd&apos; post</title>'
  );
  expect(xml).toContain('x=1&amp;y=2');
});

test('item carries link, guid, RFC 822 date, categories and enclosure', () => {
  const xml = rssXml({ site, posts: [post], baseUrl });
  expect(xml).toContain(
    '<guid isPermaLink="true">https://example.com/blog/a</guid>'
  );
  expect(xml).toContain('<pubDate>Sun, 27 Sep 2026 15:58:45 GMT</pubDate>');
  expect(xml).toContain('<category>Art</category><category>Code</category>');
  expect(xml).toContain('length="42" type="image/png"');
});

test('a clip encloses its Start frame, length unknown', () => {
  const clip = {
    ...post,
    cover: {
      asset: {
        secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/a.mp4',
        bytes: 9000
      },
      clip: { start: 2 }
    }
  };
  expect(rssXml({ site, posts: [clip], baseUrl })).toContain(
    '<enclosure url="https://res.cloudinary.com/demo/video/upload/so_2,f_webp/v1/a.webp" length="0" type="image/webp"/>'
  );
});

test('keeps the caller order; no categories means no category tags', () => {
  const b = { ...post, slug: '/blog/b', categories: null, cover: null };
  const xml = rssXml({ site, posts: [b, post], baseUrl });
  expect(xml.indexOf('/blog/b')).toBeLessThan(xml.indexOf('/blog/a'));
  expect(xml.split('<item>')[1]).not.toContain('<category>');
  expect(xml).toContain('<description>Ruben &amp; Co</description>');
  expect(xml).toContain(
    '<atom:link href="https://example.com/feed.xml" rel="self"'
  );
});

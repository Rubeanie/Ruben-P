import { expect, test } from 'bun:test';
import { baseUrl } from '@/lib/env';
import { heroThemeImage, resolveMetadata } from './resolveMetadata';

const img = (url) => ({ asset: { url } });

const site = {
  seo: {
    metaTitle: 'Site title',
    metaDescription: 'Site description',
    nofollowAttributes: true,
    seoKeywords: ['site'],
    openGraph: {
      title: 'Site OG title',
      description: null,
      siteName: 'Site name',
      image: img('https://cdn.example/site.jpg')
    },
    twitter: {
      handle: '@site',
      site: '@publisher',
      cardType: null,
      creator: null
    }
  }
};

const pageWith = (seo, extra = {}) => ({
  metadata: { slug: '/about', seo },
  ...extra
});

test('meta title and description fall back to Site settings field by field', () => {
  const m = resolveMetadata(
    pageWith({ metaTitle: 'Page title', metaDescription: null }),
    site
  );
  expect(m.title).toBe('Page title');
  expect(m.description).toBe('Site description');
});

test('Open Graph falls back to Site settings per field, then to the resolved meta fields', () => {
  const m = resolveMetadata(
    pageWith({ metaTitle: 'Page title', openGraph: { title: null } }),
    site
  );
  // The site's Open Graph title wins over the page's own meta title.
  expect(m.openGraph.title).toBe('Site OG title');
  // Neither side has an Open Graph description, so the resolved meta description stands in.
  expect(m.openGraph.description).toBe('Site description');
  expect(m.openGraph.siteName).toBe('Site name');
});

test('Open Graph title comes from the meta title when no Open Graph title exists anywhere', () => {
  const bareSite = {
    seo: { ...site.seo, openGraph: { ...site.seo.openGraph, title: null } }
  };
  const m = resolveMetadata(pageWith({ metaTitle: 'Page title' }), bareSite);
  expect(m.openGraph.title).toBe('Page title');
});

test('Twitter spells out what Next would copy from Open Graph', () => {
  const m = resolveMetadata(
    pageWith({ openGraph: { title: 'Page OG' } }),
    site
  );
  expect(m.twitter).toEqual({
    title: 'Page OG',
    description: 'Site description',
    images: [{ url: 'https://cdn.example/site.jpg' }],
    creator: '@site',
    site: '@publisher',
    card: 'summary_large_image'
  });
});

test('a set card type ships as is; a handle beats the creator', () => {
  const m = resolveMetadata(
    pageWith({
      twitter: { cardType: 'summary_large_image', handle: null, creator: '@me' }
    }),
    { seo: { ...site.seo, twitter: {} } }
  );
  expect(m.twitter.card).toBe('summary_large_image');
  expect(m.twitter.creator).toBe('@me');
});

test('a post cover is the share image ahead of the site default', () => {
  const post = pageWith({}, { cover: img('https://cdn.example/cover.gif') });
  expect(resolveMetadata(post, site).openGraph.images).toEqual([
    { url: 'https://cdn.example/cover.gif' }
  ]);
});

test("the page's own share image beats the post cover", () => {
  const post = pageWith(
    { openGraph: { image: img('https://cdn.example/own.jpg') } },
    { cover: img('https://cdn.example/cover.gif') }
  );
  expect(resolveMetadata(post, site).openGraph.images).toEqual([
    { url: 'https://cdn.example/own.jpg' }
  ]);
});

test('no share image anywhere ships no image rather than an empty one', () => {
  const m = resolveMetadata(pageWith({}), {
    seo: { ...site.seo, openGraph: { title: 'T' } }
  });
  expect(m.openGraph.images).toEqual([]);
  expect(m.twitter.images).toEqual([]);
});

test('og:url and canonical are the page address, a bare origin for home', () => {
  const m = resolveMetadata(pageWith({}), site);
  expect(m.openGraph.url).toBe(`${baseUrl}/about`);
  expect(m.alternates.canonical).toBe(`${baseUrl}/about`);
  const home = resolveMetadata({ metadata: { slug: '/', seo: {} } }, site);
  expect(home.openGraph.url).toBe(baseUrl);
});

test('noindex follows the page when set, Site settings otherwise', () => {
  expect(resolveMetadata(pageWith({}), site).robots).toEqual({
    index: false,
    follow: false
  });
  expect(
    resolveMetadata(pageWith({ nofollowAttributes: false }), site).robots
  ).toEqual({
    index: true,
    follow: true
  });
  expect(resolveMetadata(pageWith({}), { seo: {} }).robots.index).toBe(true);
});

test('no Open Graph anywhere ships none, and Twitter takes the meta fields', () => {
  const m = resolveMetadata(pageWith({ metaTitle: 'Page title' }), {
    seo: { metaDescription: 'D' }
  });
  expect(m.openGraph).toBeUndefined();
  expect(m.twitter).toMatchObject({
    title: 'Page title',
    description: 'D',
    images: [],
    card: 'summary'
  });
});

test('keywords add the page to the site ones', () => {
  expect(
    resolveMetadata(pageWith({ seoKeywords: ['page'] }), site).keywords
  ).toBe('site, page');
});

test('heroThemeImage reads only the first hero or glass hero photo', () => {
  expect(
    heroThemeImage({ modules: [{ _type: 'hero', bgImage: img('a') }] })
  ).toBe('a');
  expect(
    heroThemeImage({ modules: [{ _type: 'hero.saas', image: img('b') }] })
  ).toBe('b');
  expect(
    heroThemeImage({ modules: [{ _type: 'hero.split', image: img('c') }] })
  ).toBeNull();
  expect(heroThemeImage({ modules: [] })).toBeNull();
});

import { expect, test } from 'bun:test';
import { baseUrl } from '@/lib/env';
import { heroThemeImage, resolveMetadata } from './resolveMetadata';

// Image fields hold Cloudinary URLs only.
const CDN = 'https://res.cloudinary.com/demo/image/upload/v1/';
const img = (name) => ({ asset: { secure_url: CDN + name } });

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
      image: img('site.jpg')
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

test("the head title falls back to the document's own title before Site settings", () => {
  const m = resolveMetadata(
    pageWith({ metaTitle: null }, { title: 'About' }),
    site
  );
  expect(m.title).toBe('About');
});

test('the head title falls to Site settings when the document has no title of its own', () => {
  const m = resolveMetadata(pageWith({ metaTitle: null }), site);
  expect(m.title).toBe('Site title');
});

test("Open Graph title prefers the page's own Open Graph title over everything else", () => {
  const m = resolveMetadata(
    pageWith(
      { openGraph: { title: 'Page OG title' }, metaTitle: 'Page meta title' },
      { title: 'Page title' }
    ),
    site
  );
  expect(m.openGraph.title).toBe('Page OG title');
});

test('Open Graph title falls back to the page meta title before the page title or Site settings', () => {
  const m = resolveMetadata(
    pageWith(
      { metaTitle: 'Page meta title', openGraph: { title: null } },
      { title: 'Page title' }
    ),
    site
  );
  // The page's own meta title wins over its own title and the site's Open Graph title.
  expect(m.openGraph.title).toBe('Page meta title');
  expect(m.openGraph.siteName).toBe('Site name');
});

test("Open Graph title falls back to the page's own title before Site settings", () => {
  const m = resolveMetadata(
    pageWith(
      { metaTitle: null, openGraph: { title: null } },
      { title: 'Page title' }
    ),
    site
  );
  expect(m.openGraph.title).toBe('Page title');
});

test("the site's Open Graph title wins when the page has no title of its own", () => {
  const m = resolveMetadata(
    pageWith({ metaTitle: null, openGraph: { title: null } }),
    site
  );
  expect(m.openGraph.title).toBe('Site OG title');
});

test('Open Graph title falls all the way to the Site settings meta title when nothing else is set', () => {
  const bareSite = {
    seo: { ...site.seo, openGraph: { ...site.seo.openGraph, title: null } }
  };
  const m = resolveMetadata(
    pageWith({ metaTitle: null, openGraph: { title: null } }),
    bareSite
  );
  expect(m.openGraph.title).toBe('Site title');
});

test("Open Graph description prefers the page's own Open Graph description over everything else", () => {
  const siteWithOgDescription = {
    seo: {
      ...site.seo,
      openGraph: { ...site.seo.openGraph, description: 'Site OG description' }
    }
  };
  const m = resolveMetadata(
    pageWith({
      openGraph: { description: 'Page OG description' },
      metaDescription: 'Page meta description'
    }),
    siteWithOgDescription
  );
  expect(m.openGraph.description).toBe('Page OG description');
});

test('Open Graph description falls back to the page meta description before Site settings', () => {
  const siteWithOgDescription = {
    seo: {
      ...site.seo,
      openGraph: { ...site.seo.openGraph, description: 'Site OG description' }
    }
  };
  const m = resolveMetadata(
    pageWith({
      metaDescription: 'Page meta description',
      openGraph: { description: null }
    }),
    siteWithOgDescription
  );
  expect(m.openGraph.description).toBe('Page meta description');
});

test("Site settings' Open Graph description wins when the page has none of its own", () => {
  const siteWithOgDescription = {
    seo: {
      ...site.seo,
      openGraph: { ...site.seo.openGraph, description: 'Site OG description' }
    }
  };
  const m = resolveMetadata(
    pageWith({ metaDescription: null, openGraph: { description: null } }),
    siteWithOgDescription
  );
  expect(m.openGraph.description).toBe('Site OG description');
});

test('Open Graph description falls all the way to the Site settings meta description when nothing else is set', () => {
  const m = resolveMetadata(
    pageWith({ metaDescription: null, openGraph: { description: null } }),
    site
  );
  expect(m.openGraph.description).toBe('Site description');
});

test('Twitter spells out what Next would copy from Open Graph', () => {
  const m = resolveMetadata(
    pageWith({ openGraph: { title: 'Page OG' } }),
    site
  );
  expect(m.twitter).toEqual({
    title: 'Page OG',
    description: 'Site description',
    images: m.openGraph.images,
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

test('a page gets its generated card, sized, ahead of the cover and the site default', () => {
  const post = pageWith({}, { cover: img('cover.gif') });
  const m = resolveMetadata(post, site);
  expect(m.openGraph.images).toEqual([
    {
      url: `${baseUrl}/og/about`,
      width: 1200,
      height: 630,
      type: 'image/jpeg'
    }
  ]);
  expect(m.twitter.images).toEqual(m.openGraph.images);
  expect(m.twitter.card).toBe('summary_large_image');
});

test('the home card sits at the bare route', () => {
  const home = resolveMetadata({ metadata: { slug: '/', seo: {} } }, site);
  expect(home.openGraph.images[0].url).toBe(`${baseUrl}/og`);
});

test("the page's own share image beats the generated card, untouched", () => {
  const post = pageWith(
    { openGraph: { image: img('own.jpg') } },
    { cover: img('cover.gif') }
  );
  expect(resolveMetadata(post, site).openGraph.images).toEqual([
    { url: CDN + 'own.jpg' }
  ]);
});

test('a page with no open graph anywhere still ships its card', () => {
  const m = resolveMetadata(pageWith({ metaTitle: 'Page title' }), {
    seo: { metaDescription: 'D' }
  });
  expect(m.openGraph).toMatchObject({ title: 'Page title', description: 'D' });
  expect(m.openGraph.images).toHaveLength(1);
});

test('without an address there is no card, so the site default stands', () => {
  const m = resolveMetadata({ metadata: { seo: {} } }, site);
  expect(m.openGraph.images).toEqual([{ url: CDN + 'site.jpg' }]);
  const none = resolveMetadata(
    { metadata: { slug: '404', seo: {} } },
    { seo: { ...site.seo, openGraph: { title: 'T' } } }
  );
  expect(none.openGraph.images).toEqual([]);
  expect(none.twitter.images).toEqual([]);
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
  const m = resolveMetadata(
    { metadata: { seo: { metaTitle: 'Page title' } } },
    {
      seo: { metaDescription: 'D' }
    }
  );
  expect(m.openGraph).toBeUndefined();
  expect(m.twitter).toMatchObject({
    title: 'Page title',
    description: 'D',
    images: [],
    card: 'summary'
  });
});

test('keywords are the focus keyphrase alone', () => {
  expect(
    resolveMetadata(
      pageWith({
        focusKeyphrase: 'night car photography',
        seoKeywords: ['old']
      }),
      site
    ).keywords
  ).toBe('night car photography');
  expect(resolveMetadata(pageWith({}), site).keywords).toBeUndefined();
});

test('heroThemeImage reads only the first hero or glass hero photo', () => {
  expect(
    heroThemeImage({ modules: [{ _type: 'hero', bgImage: img('a') }] })
  ).toBe(CDN + 'a');
  expect(
    heroThemeImage({ modules: [{ _type: 'hero.saas', image: img('b') }] })
  ).toBe(CDN + 'b');
  expect(
    heroThemeImage({ modules: [{ _type: 'hero.split', image: img('c') }] })
  ).toBeNull();
  expect(heroThemeImage({ modules: [] })).toBeNull();
});

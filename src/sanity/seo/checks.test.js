import { expect, test } from 'bun:test';
import {
  changedSince,
  hasPhrase,
  liveUrl,
  seoChecks,
  seoReviewInput
} from './checks';

const block = (style, text, _key = text) => ({
  _type: 'block',
  _key,
  style,
  children: [{ _type: 'span', text }]
});
const asset = { _ref: 'image-a' };
const site = { seo: { metaDescription: 'The site default description.' } };

const good = {
  _type: 'page.post',
  title: 'Night drives',
  cover: { asset },
  metadata: {
    slug: { current: '/portfolio/night-drives' },
    seo: {
      metaTitle: 'Night drives: a photo series from the Hume Highway',
      metaDescription:
        'Twelve long exposures shot between Albury and Goulburn after midnight, with the settings, the routes and the one shot that nearly got away.'
    }
  },
  modules: [
    {
      _type: 'hero',
      bgImage: { asset },
      bgImageAlt: 'Tail lights on the Hume',
      content: [block('h1', 'Night drives'), block('normal', 'Twelve shots.')]
    },
    {
      _type: 'richtext-module',
      content: [block('h2', 'The routes'), block('h3', 'Albury')]
    }
  ]
};

test('a well-set post is good', () => {
  const { verdict, items } = seoChecks(good, site);
  expect(verdict).toBe('good');
  expect(items.filter((item) => item.level !== 'good')).toEqual([
    {
      level: 'info',
      text: "Add a focus keyphrase to check it's used where search engines look."
    }
  ]);
});

test('every photo a hero renders needs alt text', () => {
  const missing = (modules) =>
    seoChecks({ ...good, modules }, site).items.some((item) =>
      item.text.includes('without alt text')
    );
  expect(missing(good.modules)).toBe(false);
  expect(
    missing([{ ...good.modules[0], bgImageAlt: '' }, good.modules[1]])
  ).toBe(true);
  expect(missing([{ _type: 'hero.saas', image: { asset } }])).toBe(true);
});

test('a page leaning on defaults needs work, worst first', () => {
  const page = {
    _type: 'page',
    title: 'About',
    metadata: { slug: { current: '/about' } },
    modules: [
      {
        _type: 'richtext-module',
        content: [block('h2', 'Hi'), { _type: 'imageBlock', image: { asset } }]
      }
    ]
  };
  const { verdict, items } = seoChecks(page, {
    seo: { nofollowAttributes: true }
  });
  expect(verdict).toBe('weak');
  expect(items.map((item) => item.text)).toEqual([
    'No description. Search engines will pick a snippet from the page.',
    'No Heading 1. Give the hero or the first rich text block one.',
    'Title is 5 characters; aim for 50-60.',
    'The generated share card has no photo; set a share image or give the page a hero photo.',
    '1 image without alt text. Describe what each shows, or leave it empty only when it is decoration.',
    'Site settings has Prevent indexing on, so search engines leave this page out.',
    "Add a focus keyphrase to check it's used where search engines look."
  ]);
});

test('short descriptions, site defaults and skipped levels are flagged', () => {
  const texts = (doc) => seoChecks(doc, site).items.map((item) => item.text);
  const withSeo = (seo, modules = good.modules) => ({
    ...good,
    metadata: { ...good.metadata, seo: { ...good.metadata.seo, ...seo } },
    modules
  });
  expect(texts(withSeo({ metaDescription: 'Too short by far.' }))).toContain(
    'Description is 17 characters; aim for 120-160.'
  );
  expect(texts(withSeo({ metaDescription: null }))).toContain(
    'No description of its own; the Site settings one ships, the same on every such page.'
  );
  expect(
    texts(
      withSeo({}, [
        {
          _type: 'richtext-module',
          content: [block('h1', 'A'), block('h3', 'B')]
        }
      ])
    )
  ).toContain('"B" jumps from Heading 1 to Heading 3; use Heading 2.');
});

test('template pages are never judged', () => {
  const { verdict, items } = seoChecks(
    { _type: 'page', metadata: { slug: { current: '404' } } },
    site
  );
  expect(verdict).toBe('good');
  expect(items).toHaveLength(1);
});

test('the AI reads the shipped copy beside the page text', () => {
  expect(seoReviewInput(good, site)).toEqual({
    title: 'Night drives: a photo series from the Hume Highway',
    description: good.metadata.seo.metaDescription,
    pageTitle: 'Night drives',
    keyphrase: '',
    summary: '',
    headings: ['Night drives', 'The routes', 'Albury'],
    excerpt: 'Twelve shots.'
  });
});

test('only a published real page has a live address', () => {
  expect(liveUrl(null).reason).toMatch(/Publish/);
  expect(liveUrl({ metadata: { slug: { current: '404' } } }).reason).toMatch(
    /no public address/
  );
});

test('Creative headings and accordion questions count as h3s', () => {
  const page = {
    ...good,
    modules: [
      good.modules[0],
      {
        _type: 'creative-module',
        columns: [{ blocks: [{ _type: 'heading', text: 'Gear' }] }]
      },
      { _type: 'accordion-list', items: [{ summary: 'Why film?' }] }
    ]
  };
  const texts = seoChecks(page, site).items.map((item) => item.text);
  expect(texts).toContain(
    '"Gear" jumps from Heading 1 to Heading 3; use Heading 2.'
  );
  expect(seoReviewInput(page, site).headings).toEqual([
    'Night drives',
    'Gear',
    'Why film?'
  ]);
});

test('hasPhrase matches whole words, ignoring case, punctuation and plain plurals', () => {
  expect(hasPhrase('Night drives: a photo series', 'night drive')).toBe(true);
  expect(hasPhrase('/portfolio/night-drives', 'Night Drives')).toBe(true);
  expect(
    hasPhrase("Car photography, Melbourne's best", 'car photography melbourne')
  ).toBe(true);
  expect(hasPhrase('Knight drives', 'night drives')).toBe(false);
  expect(hasPhrase('Drives at night', 'night drives')).toBe(false);
  expect(hasPhrase('anything', '  ')).toBe(false);
});

test('a focus keyphrase is looked for where search engines look', () => {
  const withPhrase = (focusKeyphrase) => ({
    ...good,
    metadata: {
      ...good.metadata,
      seo: { ...good.metadata.seo, focusKeyphrase }
    },
    modules: [
      ...good.modules,
      {
        _type: 'richtext-module',
        content: [block('normal', 'Later text about Hume Highway photos.')]
      }
    ]
  });
  const texts = (doc, used) =>
    seoChecks(doc, site, { keyphraseUsedBy: used }).items.map((i) => [
      i.level,
      i.text
    ]);
  expect(texts(withPhrase('night drives'))).toEqual(
    expect.arrayContaining([
      ['good', 'Keyphrase is in the title.'],
      ['warn', "Keyphrase isn't in the description."],
      ['good', 'Keyphrase is in the Heading 1.'],
      ['warn', "Keyphrase isn't in the first paragraph."],
      ['good', 'Keyphrase is in the URL.']
    ])
  );
  expect(texts(withPhrase('Hume Highway'), ['Road trips', 'Albury'])).toEqual(
    expect.arrayContaining([
      ['warn', "Keyphrase isn't in the URL."],
      [
        'warn',
        '"Road trips" and 1 other page already use this keyphrase, so they compete for it.'
      ]
    ])
  );
  expect(seoReviewInput(withPhrase(' night drives '), site).keyphrase).toBe(
    'night drives'
  );
});

test('titles aim for 50-60 characters and descriptions for 120-160', () => {
  const texts = (seo) =>
    seoChecks(
      {
        ...good,
        metadata: { ...good.metadata, seo: { ...good.metadata.seo, ...seo } }
      },
      site
    ).items.map((item) => [item.level, item.text]);
  expect(texts({ metaTitle: 'x'.repeat(45) })).toContainEqual([
    'warn',
    'Title is 45 characters; aim for 50-60.'
  ]);
  expect(texts({ metaTitle: 'x'.repeat(61) })).toContainEqual([
    'warn',
    'Title is 61 characters; search results cut it off near 60.'
  ]);
  expect(texts({ metaTitle: 'x'.repeat(55) })).toContainEqual([
    'good',
    'Title is 55 characters.'
  ]);
  expect(texts({ metaDescription: 'x'.repeat(69) })[0]).toEqual([
    'bad',
    'Description is 69 characters; aim for 120-160.'
  ]);
  expect(texts({ metaDescription: 'x'.repeat(100) })).toContainEqual([
    'warn',
    'Description is 100 characters; aim for 120-160.'
  ]);
  expect(texts({ metaDescription: 'x'.repeat(161) })).toContainEqual([
    'warn',
    'Description is 161 characters; search results cut it off near 160.'
  ]);
});

test('changedSince names only the fields that moved', () => {
  const read = { title: 'A', description: 'B', keyphrase: 'c' };
  expect(changedSince(read, { ...read, title: 'A2' })).toEqual({
    title: true,
    description: false,
    keyphrase: false
  });
  expect(changedSince(read, read)).toEqual({
    title: false,
    description: false,
    keyphrase: false
  });
});

import { expect, test } from 'bun:test';
import { anchors, decodeFragment, slugify } from './anchors';

const block = (style, text) => ({
  _type: 'block',
  _key: text,
  style,
  children: [{ _type: 'span', text }]
});

const rich = (_key, ...content) => ({
  _type: 'richtext-module',
  _key,
  content
});

test.each([
  ['Process', 'process'],
  ['Performance & accessibility', 'performance-accessibility'],
  ['Don’t repeat yourself', 'dont-repeat-yourself'],
  ['Café crème', 'cafe-creme'],
  ['  --  ', 'section'],
  ['ご案内', 'ご案内']
])('slugify(%j) is %j', (text, slug) => {
  expect(slugify(text)).toBe(slug);
});

test('headings are unique across the page, in document order', () => {
  const { headings } = anchors([
    rich(
      'a',
      block('h1Large', 'Title'),
      block('h2', 'Overview'),
      block('normal', 'Copy')
    ),
    rich('b', block('h3', 'Overview'), block('h2', 'Overview 2'))
  ]);
  expect(headings.map((h) => [h.id, h.level])).toEqual([
    ['title', 1],
    ['overview', 2],
    ['overview-2', 3],
    ['overview-2-2', 2]
  ]);
});

test('a heading never takes a module id or a hero end marker', () => {
  const { headings } = anchors([
    { _type: 'hero', _key: 'k1', uid: 'intro' },
    rich(
      'process',
      block('h2', 'Intro'),
      block('h2', 'Intro end'),
      block('h2', 'Process')
    )
  ]);
  expect(headings.map((h) => h.id)).toEqual([
    'intro-2',
    'intro-end-2',
    'process-2'
  ]);
});

test('ids land on the nodes the components render', () => {
  const { modules } = anchors([
    {
      _type: 'creative-module',
      _key: 'c',
      columns: [{ _key: 'col', blocks: [{ _type: 'heading', text: 'Fast' }] }]
    },
    {
      _type: 'accordion-list',
      _key: 'faq',
      items: [{ _key: 'q', summary: 'Why?', content: [block('h3', 'Because')] }]
    },
    {
      _type: 'callout',
      _key: 'cta',
      content: [block('h2', 'Say hello'), block('normal', 'Why?')]
    }
  ]);
  expect(modules[0].columns[0].blocks[0].anchor).toBe('fast');
  expect(modules[1].items[0].anchor).toBe('why');
  expect(modules[1].items[0].content[0].anchor).toBe('because');
  expect(modules[2].content[0].anchor).toBe('say-hello');
  expect(modules[2].content[1].anchor).toBeUndefined();
});

test('entries are tagged with where they sit', () => {
  const { headings } = anchors([
    rich('r', block('h2', 'Prose')),
    {
      _type: 'creative-module',
      _key: 'c',
      uid: 'features',
      columns: [{ _key: 'col', blocks: [{ _type: 'heading', text: 'Fast' }] }]
    },
    {
      _type: 'accordion-list',
      _key: 'faq',
      items: [{ _key: 'q', summary: 'Why?', content: [block('h3', 'Because')] }]
    }
  ]);
  expect(
    headings.map(({ id, kind, moduleId }) => [id, kind, moduleId])
  ).toEqual([
    ['prose', 'prose', 'r'],
    ['fast', 'creative', 'features'],
    ['why', 'accordion', 'faq'],
    ['because', 'accordion', 'faq']
  ]);
});

test('fixed page ids and module key fallbacks are reserved', () => {
  const { headings } = anchors([
    rich(
      'k9',
      block('h2', 'Top'),
      block('h2', 'Nav menu'),
      block('h2', 'K9'),
      block('h2', 'K9 end')
    )
  ]);
  expect(headings.map((h) => h.id)).toEqual([
    'top-2',
    'nav-menu-2',
    'k9-2',
    'k9-end-2'
  ]);
});

test('copy links go on prose h2s and h3s only, when the page asks', () => {
  const page = [
    rich('a', block('h1', 'Title'), block('h2', 'Two'), block('h3', 'Three')),
    {
      _type: 'creative-module',
      _key: 'c',
      columns: [{ _key: 'col', blocks: [{ _type: 'heading', text: 'Fast' }] }]
    },
    {
      _type: 'accordion-list',
      _key: 'faq',
      items: [{ _key: 'q', summary: 'Why?', content: [block('h2', 'Because')] }]
    }
  ];
  const linked = (modules) => [
    ...modules[0].content.map((b) => b.anchorLink ?? false),
    modules[1].columns[0].blocks[0].anchorLink ?? false,
    modules[2].items[0].anchorLink ?? false,
    modules[2].items[0].content[0].anchorLink ?? false
  ];
  expect(linked(anchors(page).modules)).toEqual(Array(6).fill(false));
  expect(linked(anchors(page, { links: true }).modules)).toEqual([
    false,
    true,
    true,
    false,
    false,
    false
  ]);
});

test('decodeFragment decodes, and returns null for a malformed escape', () => {
  expect(decodeFragment('caf%C3%A9')).toBe('café');
  expect(decodeFragment('process')).toBe('process');
  expect(decodeFragment('100%')).toBeNull();
});

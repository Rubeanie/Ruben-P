import { expect, test } from 'bun:test';
import { anchors } from './anchors';
import { groupsOf, structureKey, tocCount, tocEntries } from './toc';
import { currentAt, fillAt } from './tocSpy';
import { pageBlock } from '@/sanity/schemaTypes/fragments/page-block';

const block = (style, text) => ({
  _type: 'block',
  _key: text,
  style,
  children: [{ _type: 'span', text }]
});

const outline = (modules, following = modules) =>
  tocEntries(anchors(modules).headings, following).map((e) => [
    e.id,
    e.text,
    e.level
  ]);

test('prose h2s and h3s are entries, h1s and body copy are not', () => {
  expect(
    outline([
      {
        _type: 'richtext-module',
        _key: 'a',
        content: [
          block('h1', 'Title'),
          block('h2', 'Process'),
          block('normal', 'Copy'),
          block('h3', 'Research')
        ]
      }
    ])
  ).toEqual([
    ['process', 'Process', 2],
    ['research', 'Research', 3]
  ]);
});

test('a column module is one entry, named by its first heading, linking to the module', () => {
  expect(
    outline([
      {
        _type: 'creative-module',
        _key: 'cols',
        uid: 'principles',
        columns: [
          { blocks: [{ _type: 'icon', icon: 'gauge' }] },
          { blocks: [{ _type: 'heading', text: 'Fast' }] },
          { blocks: [{ _type: 'heading', text: 'Accessible' }] }
        ]
      },
      { _type: 'creative-module', _key: 'bare', columns: [{ blocks: [] }] }
    ])
  ).toEqual([['principles', 'Fast', 2]]);
});

test('accordion questions and other modules add nothing', () => {
  expect(
    outline([
      {
        _type: 'accordion-list',
        _key: 'faq',
        items: [{ summary: 'Why?', content: [block('h2', 'Because')] }]
      },
      { _type: 'stat-list', _key: 'stats', uid: 'numbers' }
    ])
  ).toEqual([]);
});

test('only the modules after the table of contents count', () => {
  const modules = [
    { _type: 'richtext-module', _key: 'm1', content: [block('h2', 'Intro')] },
    { _type: 'table-of-contents', _key: 'toc' },
    { _type: 'richtext-module', _key: 'm3', content: [block('h2', 'Body')] }
  ];
  expect(outline(modules, modules.slice(2))).toEqual([['body', 'Body', 2]]);
});

test('h3s group under the h2 before them', () => {
  const groups = groupsOf([
    { id: 'lead', level: 3 },
    { id: 'a', level: 2 },
    { id: 'a1', level: 3 },
    { id: 'b', level: 2 }
  ]);
  expect(groups.map((g) => [g.id, g.children.map((c) => c.id)])).toEqual([
    ['lead', []],
    ['a', ['a1']],
    ['b', []]
  ]);
});

const knots = { at: [100, 300, 500], done: 800 };

test.each([
  [0, -1],
  [99, -1],
  [100, 0],
  [450, 1],
  [799, 2],
  [2000, 2]
])('at scroll %i the current heading is %i', (y, index) => {
  expect(currentAt(y, knots)).toBe(index);
});

test('the progress line runs through each mark and ends at the footer', () => {
  const marks = [10, 50, 90];
  expect(fillAt(0, knots, marks, 120)).toBe(0);
  expect(fillAt(50, knots, marks, 120)).toBe(5);
  expect(fillAt(300, knots, marks, 120)).toBe(50);
  expect(fillAt(650, knots, marks, 120)).toBe(105);
  expect(fillAt(900, knots, marks, 120)).toBe(120);
});

test('a heading that changes level changes the structure key', () => {
  const before = [
    { id: 'a', level: 2 },
    { id: 'b', level: 2 }
  ];
  const after = [
    { id: 'a', level: 2 },
    { id: 'b', level: 3 }
  ];
  expect(structureKey(after)).not.toBe(structureKey(before));
  expect(structureKey([...before])).toBe(structureKey(before));
});

test.each([
  [[], 0],
  [[{ _type: 'table-of-contents' }, { _type: 'richtext-module' }], 1],
  [[{ _type: 'table-of-contents' }, { _type: 'table-of-contents' }], 2],
  [null, 0]
])('tocCount counts the tables of contents on a page', (modules, count) => {
  expect(tocCount(modules)).toBe(count);
});

test('the Studio refuses a second table of contents on a page', () => {
  const check = pageBlock.validation({ custom: (fn) => fn });
  const toc = { _type: 'table-of-contents' };
  expect(check([toc])).toBe(true);
  expect(check([toc, toc])).toBe('A page takes one table of contents.');
});

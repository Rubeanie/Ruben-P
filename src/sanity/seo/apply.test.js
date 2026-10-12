import { expect, test } from 'bun:test';
import { fixEdit, matchEdit, pathString, planEdit } from './apply';
import { proofreadItems } from './proofread';

const doc = {
  title: '  Nigth drives',
  metadata: { seo: { metaDescription: 'Shots from the hume.' } },
  modules: [
    {
      _type: 'richtext-module',
      _key: 'r',
      content: [
        {
          _type: 'block',
          _key: 'b',
          children: [
            { _key: 's1', text: 'Their going ' },
            { _key: 's2', text: 'home now.' }
          ]
        }
      ]
    }
  ]
};
const items = proofreadItems(doc);
const item = (key) => items.find((i) => i.key === key);

test('paths name arrays by _key and fields by name', () => {
  expect(
    pathString([
      'modules',
      { _key: 'r' },
      'content',
      { _key: 'b' },
      'children',
      { _key: 's1' },
      'text'
    ])
  ).toBe('modules[_key=="r"].content[_key=="b"].children[_key=="s1"].text');
  expect(pathString(['metadata', 'seo', 'metaDescription'])).toBe(
    'metadata.seo.metaDescription'
  );
  expect(pathString(['modules', 2, 'title'])).toBe('modules[2].title');
});

test('a LanguageTool fix sets its own string, trimmed offsets included', () => {
  const title = item('title');
  const match = { ...title, offset: 0, length: 5 };
  expect(planEdit(doc, matchEdit(match, 'Night'))).toEqual({
    path: 'title',
    value: '  Night drives'
  });
});

test('an AI fix inside one span sets only that span', () => {
  const block = item('modules/r/content/b');
  const fix = {
    ...block,
    original: 'Their going',
    suggestion: "They're going"
  };
  expect(planEdit(doc, fixEdit(fix))).toEqual({
    path: 'modules[_key=="r"].content[_key=="b"].children[_key=="s1"].text',
    value: "They're going "
  });
});

test('words across two spans are copy-only', () => {
  const block = item('modules/r/content/b');
  const fix = { ...block, original: 'going home', suggestion: 'heading home' };
  expect(planEdit(doc, fixEdit(fix))).toBeNull();
});

test('an AI fix for repeated words is copy-only', () => {
  const fix = {
    path: ['summary'],
    start: 0,
    text: 'Our team is great. Our team is great at design.',
    original: 'great',
    suggestion: 'strong'
  };
  expect(fixEdit(fix)).toBeNull();
  expect(fixEdit({ ...fix, original: 'great at' })).toMatchObject({
    offset: 31
  });
});

test('changed or moved text is stale', () => {
  const seo = item('metaDescription');
  const edit = matchEdit({ ...seo, offset: 15, length: 4 }, 'Hume');
  const changed = {
    ...doc,
    metadata: { seo: { metaDescription: 'Shots from the M31.' } }
  };
  expect(planEdit(changed, edit)).toEqual({ stale: true });
  const moved = {
    ...doc,
    metadata: { seo: { metaDescription: 'New shots from the hume.' } }
  };
  expect(planEdit(moved, edit)).toEqual({ stale: true });
  const removed = { ...doc, metadata: {} };
  expect(planEdit(removed, edit)).toEqual({ stale: true });
});

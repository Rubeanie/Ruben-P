import { expect, test } from 'bun:test';
import { cardText, pathLine } from './copy';

const site = { title: 'Ruben-P', metaDescription: 'Site description' };

test('the path line is the host and the parent path', () => {
  expect(pathLine('www.ruben-p.com', '/portfolio/omg-thing')).toBe(
    'ruben-p.com/portfolio/'
  );
  expect(pathLine('ruben-p.com', '/about')).toBe('ruben-p.com/');
  expect(pathLine('ruben-p.com', '/')).toBe('ruben-p.com/');
});

test("a page's own title comes first; home is the site", () => {
  const page = { title: 'About', seo: { metaTitle: 'About me' } };
  expect(cardText({ page, site, path: '/about' }).title).toBe('About me');
  expect(cardText({ page, site, path: '/' }).title).toBe('Ruben-P');
  expect(
    cardText({ page: { title: 'Plain' }, site, path: '/plain' }).title
  ).toBe('Plain');
});

test('a post lists its date and categories in the site order', () => {
  const page = {
    _type: 'page.post',
    title: 'Post',
    publishDate: '2026-09-22',
    categories: [
      { _id: 'b', title: 'B' },
      { _id: 'a', title: 'A' }
    ]
  };
  const { facts } = cardText({
    page,
    site: { ...site, postCategories: [{ _id: 'a' }, { _id: 'b' }] },
    path: '/portfolio/post'
  });
  expect(facts.date).toBe('22 September 2026');
  expect(facts.categories.map((c) => c.title)).toEqual(['A', 'B']);
});

test('a social says its handle once, in the facts row', () => {
  const social = { title: 'YouTube', username: '@me' };
  expect(cardText({ social, site, path: '/socials/youtube' })).toEqual({
    title: 'YouTube',
    description: '',
    facts: { handle: '@me' }
  });
});

test('a description that repeats the facts row is left out', () => {
  const page = {
    _type: 'page.post',
    title: 'Post',
    summary: 'Main',
    categories: [{ _id: 'm', title: 'Main' }]
  };
  expect(cardText({ page, site, path: '/p' }).description).toBe('');
});

test('a whitespace-only field counts as unset', () => {
  const page = {
    title: 'Real title',
    summary: 'Summary',
    seo: { metaTitle: '   ', openGraph: { title: '\n', description: ' ' } }
  };
  const text = cardText({ page, site, path: '/p' });
  expect(text.title).toBe('Real title');
  expect(text.description).toBe('Summary');
});

import { expect, test } from 'bun:test';
import {
  byCategory,
  categorySlug,
  featuredFirst,
  formatDate,
  inkFor,
  orderCategories,
  relatedPosts
} from './posts';

test('featuredFirst lifts featured posts and keeps date order in each group', () => {
  const posts = [
    { _id: 'a', publishDate: '2026-03-01' },
    { _id: 'b', featured: true, publishDate: '2026-02-01' },
    { _id: 'c', publishDate: '2026-01-15' },
    { _id: 'd', featured: true, publishDate: '2026-01-01' }
  ];
  expect(featuredFirst(posts).map((p) => p._id)).toEqual(['b', 'd', 'a', 'c']);
  // The index itself is left in date order.
  expect(posts.map((p) => p._id)).toEqual(['a', 'b', 'c', 'd']);
});

test('categorySlug lowercases and hyphenates', () => {
  expect(categorySlug('3D Printing!')).toBe('3d-printing');
});

test('categorySlug handles empty and undefined', () => {
  expect(categorySlug('')).toBe('');
  expect(categorySlug(undefined)).toBe('');
});

const cat = (id) => ({ _id: id });

test('relatedPosts excludes the current post', () => {
  const current = {
    _id: '1',
    categories: [cat('a')],
    publishDate: '2026-01-01'
  };
  const posts = [
    current,
    { _id: '2', categories: [cat('a')], publishDate: '2026-01-02' }
  ];
  const result = relatedPosts(posts, current, 5);
  expect(result.map((p) => p._id)).not.toContain('1');
});

test('relatedPosts ranks two shared categories above one', () => {
  const current = {
    _id: '1',
    categories: [cat('a'), cat('b')],
    publishDate: '2026-01-01'
  };
  const oneShared = {
    _id: '2',
    categories: [cat('a')],
    publishDate: '2026-01-05'
  };
  const twoShared = {
    _id: '3',
    categories: [cat('a'), cat('b')],
    publishDate: '2026-01-01'
  };
  const posts = [current, oneShared, twoShared];
  const result = relatedPosts(posts, current, 5);
  expect(result.map((p) => p._id)).toEqual(['3', '2']);
});

test('relatedPosts breaks ties by newest publishDate', () => {
  const current = {
    _id: '1',
    categories: [cat('a')],
    publishDate: '2026-01-01'
  };
  const older = { _id: '2', categories: [cat('a')], publishDate: '2026-01-01' };
  const newer = { _id: '3', categories: [cat('a')], publishDate: '2026-01-10' };
  const posts = [current, older, newer];
  const result = relatedPosts(posts, current, 5);
  expect(result.map((p) => p._id)).toEqual(['3', '2']);
});

test('relatedPosts falls back to featured then newest when current has no categories', () => {
  const current = { _id: '1', categories: [], publishDate: '2026-01-01' };
  const other1 = {
    _id: '2',
    categories: [cat('a')],
    publishDate: '2026-01-05'
  };
  const other2 = { _id: '3', categories: [], publishDate: '2026-01-01' };
  const starred = {
    _id: '4',
    featured: true,
    categories: [],
    publishDate: '2025-12-01'
  };
  const posts = [current, other1, other2, starred];
  const result = relatedPosts(posts, current, 5);
  expect(result.map((p) => p._id)).toEqual(['4', '2', '3']);
});

test('relatedPosts respects the limit', () => {
  const current = {
    _id: '1',
    categories: [cat('a')],
    publishDate: '2026-01-01'
  };
  const posts = [
    current,
    { _id: '2', categories: [cat('a')], publishDate: '2026-01-02' },
    { _id: '3', categories: [cat('a')], publishDate: '2026-01-03' },
    { _id: '4', categories: [cat('a')], publishDate: '2026-01-04' }
  ];
  const result = relatedPosts(posts, current, 2);
  expect(result).toHaveLength(2);
});

test('inkFor picks dark ink on light colours and light ink on dark ones', () => {
  expect(inkFor('#f6c85f')).toBe('dark');
  expect(inkFor('#38bdf8')).toBe('dark');
  expect(inkFor('#1e1b4b')).toBe('light');
  expect(inkFor('#000000')).toBe('light');
});

test('inkFor falls back to light ink without a valid hex', () => {
  expect(inkFor(undefined)).toBe('light');
  expect(inkFor('red')).toBe('light');
});

test('formatDate renders the calendar day the same in every runtime', () => {
  expect(formatDate('2026-02-09')).toBe('9 Feb 2026');
  expect(formatDate('2026-09-18')).toBe('18 Sep 2026');
  expect(formatDate('2026-02-09T23:30:00Z')).toBe('9 Feb 2026');
  expect(formatDate('nope')).toBe('');
});

test('byCategory sorts by title', () => {
  const cats = [{ title: 'Web' }, { title: 'Audio' }, { title: 'Electrical' }];
  expect([...cats].sort(byCategory).map((c) => c.title)).toEqual([
    'Audio',
    'Electrical',
    'Web'
  ]);
});

test('orderCategories follows the site order, then title for the rest', () => {
  const order = [{ _id: 'web' }, { _id: 'audio' }];
  const cats = [
    { _id: 'zed', title: 'Zed' },
    { _id: 'audio', title: 'Audio' },
    { _id: 'alpha', title: 'Alpha' },
    { _id: 'web', title: 'Web' }
  ];
  expect(orderCategories(cats, order).map((c) => c._id)).toEqual([
    'web',
    'audio',
    'alpha',
    'zed'
  ]);
  expect(orderCategories(cats, []).map((c) => c._id)).toEqual([
    'alpha',
    'audio',
    'web',
    'zed'
  ]);
});

test('byCategory compares titles without their stega markers', () => {
  const marked = (title) => ({ title: `${title}​⁠stega` });
  expect(byCategory(marked('Audio'), marked('Web'))).toBeLessThan(0);
  expect(byCategory(marked('Web'), marked('Audio'))).toBeGreaterThan(0);
});

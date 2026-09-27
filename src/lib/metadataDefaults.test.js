import { expect, test } from 'bun:test';
import { withDefaults } from './metadataDefaults';

test('withDefaults falls back field by field, not per object', () => {
  const site = {
    title: 'Site title',
    description: 'Site description',
    url: 'https://site.example'
  };
  const page = { title: 'Page title', description: null };
  expect(withDefaults(page, site)).toEqual({
    title: 'Page title',
    description: 'Site description',
    url: 'https://site.example'
  });
});

test('withDefaults returns undefined when neither side has a value', () => {
  expect(withDefaults(null, undefined)).toBeUndefined();
});

test('withDefaults keeps the page value alone when the site has nothing', () => {
  const page = { title: 'Page title' };
  expect(withDefaults(page, null)).toEqual({ title: 'Page title' });
});

import { expect, test } from 'bun:test';
import { ringRadii } from './rings';

test('rings are stable per page and differ between pages', () => {
  expect(ringRadii('page-a')).toEqual(ringRadii('page-a'));
  expect(ringRadii('page-a')).not.toEqual(ringRadii('page-b'));
});

test('rings start at the logo, sit 30 to 80 px apart and reach past the far corner', () => {
  const radii = ringRadii('page-a');
  expect(radii[0]).toBe(60);
  radii.slice(1).forEach((r, i) => {
    expect(r - radii[i]).toBeGreaterThanOrEqual(30);
    expect(r - radii[i]).toBeLessThan(80);
  });
  expect(radii.at(-1)).toBeGreaterThan(1320);
});

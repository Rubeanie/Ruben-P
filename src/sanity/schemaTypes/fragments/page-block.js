import { tocCount } from '@/lib/toc';

// These heroes pin the first screen and scroll away from it, so they only work as the opening module.
const OPENING_HEROES = new Set(['hero', 'hero.saas', 'hero.3d']);

export const misplacedHeroes = (modules) =>
  (modules ?? []).filter(
    (module, index) => index > 0 && OPENING_HEROES.has(module._type)
  );

export const pageBlock = {
  type: 'array',
  validation: (Rule) => [
    Rule.custom((modules) =>
      tocCount(modules) > 1 ? 'A page takes one table of contents.' : true
    ),
    Rule.custom((modules) => {
      const misplaced = misplacedHeroes(modules);
      return misplaced.length
        ? {
            message:
              "This hero is designed to open the page; its scroll animation assumes it's the first module.",
            paths: misplaced.map((module) => [{ _key: module._key }])
          }
        : true;
    }).warning()
  ],
  of: [
    { type: 'accordion-list' },
    { type: 'breadcrumbs' },
    { type: 'callout' },
    { type: 'creative-module' },
    { type: 'custom-html' },
    { type: 'hero' },
    { type: 'hero.saas' },
    { type: 'hero.split' },
    { type: 'hero.3d' },
    { type: 'post-list' },
    { type: 'post-featured' },
    { type: 'richtext-module' },
    { type: 'skill-list' },
    { type: 'social-list' },
    { type: 'spacer' },
    { type: 'stat-list' },
    { type: 'table-of-contents' },
    { type: 'three.js' }
  ],
  options: {
    insertMenu: {
      views: [{ name: 'list' }, { name: 'grid' }],
      groups: [
        { name: 'hero', of: ['hero', 'hero.saas', 'hero.split', 'hero.3d'] }
      ]
    }
  }
};

import { tocCount } from '@/lib/toc';

export const pageBlock = {
  type: 'array',
  validation: (Rule) =>
    Rule.custom((modules) =>
      tocCount(modules) > 1 ? 'A page takes one table of contents.' : true
    ),
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

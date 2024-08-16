export const pageBlock = {
  type: 'array',
  group: 'content',
  of: [
    { type: 'accordion-list' },
    { type: 'breadcrumbs' },
    { type: 'callout' },
    { type: 'custom-html' },
    { type: 'hero' },
    { type: 'hero.saas' },
    { type: 'hero.split' },
    { type: 'richtext-module' },
    { type: 'stat-list' }
  ],
  options: {
    insertMenu: {
      views: [{ name: 'list' }, { name: 'grid' }],
      groups: [{ name: 'hero', of: ['hero', 'hero.saas', 'hero.split'] }]
    }
  }
};
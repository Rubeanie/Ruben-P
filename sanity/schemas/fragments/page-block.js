export const pageBlock = {
  type: 'array',
  of: [
    { type: 'accordion-list' },
    { type: 'breadcrumbs' },
    { type: 'callout' },
    { type: 'creative-module' },
    { type: 'custom-html' },
    { type: 'hero' },
    { type: 'hero.saas' },
    { type: 'hero.split' },
    { type: 'portfolio-list' },
    { type: 'richtext-module' },
    { type: 'social-list' },
    { type: 'stat-list' }
  ],
  options: {
    insertMenu: {
      views: [{ name: 'list' }, { name: 'grid' }],
      groups: [
        { name: 'hero', of: ['hero', 'hero.saas', 'hero.split'] }
      ]
    }
  }
};
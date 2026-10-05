export const headingLinksField = (options) => ({
  name: 'headingLinks',
  title: 'Heading links',
  description:
    'A link glyph beside each heading copies a link to that section.',
  type: 'boolean',
  initialValue: false,
  ...options
});

import { apiVersion } from '@/lib/env';
import { isPagePath, templateSlugs } from '@/lib/slug';

export const slug = (prefix = '') => {
  return {
    name: 'slug',
    type: 'slug',
    description:
      'The page’s URL path, e.g. /about or /work/brand. The home page is /. Without a slash, 404 and redirect hold the not-found and redirect screens.',
    options: {
      source: (doc) => doc.name || doc.title || doc.metadata?.seo?.metaTitle,
      // The prefix carries its own slashes; a bare page adds its own leading one.
      slugify: (input) => {
        const clean = input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .slice(0, 200)
          .replace(/[^\p{L}\p{N}_-]/gu, '');
        return prefix ? `${prefix}${clean}` : `/${clean}`;
      },
      // Pages and posts share one path namespace, so a slug can't collide across either type.
      isUnique: async (value, context) => {
        const client = context.getClient({ apiVersion });
        const id = context.document._id.replace(/^drafts\./, '');
        return client.fetch(
          `count(*[_type in ['page', 'page.post'] && metadata.slug.current == $slug && !(_id in [$draft, $published])]) == 0`,
          { slug: value, draft: `drafts.${id}`, published: id }
        );
      }
    },
    validation: (Rule) =>
      Rule.required().custom((value) => {
        const current = value?.current ?? '';
        // A prefixed slug (e.g. posts) must stay under its own prefix, never a bare page path.
        // Template slugs ('404', 'redirect') don't start with a prefix either, so this
        // also keeps them page-only without a separate check.
        if (
          prefix &&
          !(current.startsWith(prefix) && current.length > prefix.length)
        )
          return `Slugs here start with ${prefix}.`;
        if (current === '/index') return 'The home page is /.';
        if (!isPagePath(current) && !templateSlugs.includes(current))
          return 'Start with a slash, e.g. /about. Letters, numbers, dashes and underscores only, no trailing or doubled slashes.';
        return true;
      })
  };
};

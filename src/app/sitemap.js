import { fetchSanity } from '@/lib/sanity/fetch';
import { sitemapQuery } from '@/lib/sanity/queries/sitemap';
import { baseUrl } from '@/lib/env';
import { isIndexable } from '@/lib/slug';
import { stillOf } from '@/lib/imageBlock';
import { heroPhoto } from '@/lib/heroPhotos';

// Built per request: on Vercel a publish's tag revalidation left the
// prerendered XML stale. That makes its one Sanity read uncached too, which is
// fine for a file crawlers fetch a few times a day.
export const dynamic = 'force-dynamic';

// Every indexable CMS page and post (home included).
export default async function sitemap() {
  const { pages, site } = await fetchSanity(sitemapQuery, {
    perspective: 'published',
    stega: false
  });

  return pages
    .filter((p) => isIndexable(p, site))
    .map(({ _type, slug, priority, cover, heroes, images, _updatedAt }) => {
      const d = slug.split('/').filter(Boolean).length;
      return {
        url: slug === '/' ? baseUrl : `${baseUrl}${slug}`,
        lastModified: _updatedAt,
        changeFrequency: d <= 1 ? 'weekly' : 'monthly',
        // Pages lose 0.2 a level down the breadcrumbs (floor 0.2); posts sit at 0.6.
        priority:
          priority ??
          (_type === 'page.post' ? 0.6 : Math.max(0.2, (10 - 2 * d) / 10)),
        images: [
          ...new Set(
            [cover, ...(heroes ?? []).map(heroPhoto), ...images]
              .map(stillOf)
              .filter(Boolean)
          )
        ]
      };
    });
}

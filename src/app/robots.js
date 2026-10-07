import { fetchSanity } from '@/lib/sanity/fetch';
import { robotsQuery } from '@/lib/sanity/queries/robots';
import { baseUrl } from '@/lib/env';

export default async function robots() {
  const site = await fetchSanity(robotsQuery, {
    tags: ['site'],
    perspective: 'published',
    stega: false
  });

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: site?.disallow
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}

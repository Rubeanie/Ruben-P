import { fetchSanity } from '@/lib/sanity/fetch';
import { feedQuery } from '@/lib/sanity/queries/feed';
import { baseUrl } from '@/lib/env';
import { isIndexable } from '@/lib/slug';
import { rssXml } from '@/lib/feed';

// Prerendered like the sitemap; a publish refreshes it through the Sanity tag.
export const dynamic = 'force-static';

export async function GET() {
  const { site, posts } = await fetchSanity(feedQuery, {
    perspective: 'published',
    stega: false
  });

  const xml = rssXml({
    site,
    posts: posts.filter((p) => isIndexable(p, site)),
    baseUrl
  });
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
}

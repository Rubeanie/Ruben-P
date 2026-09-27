import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { baseUrl } from '@/lib/env';
import { isPagePath } from '@/lib/slug';

// The home and contact routes, then every indexable CMS page and post. The
// same tags as the pages themselves, so a publish refreshes the sitemap too.
export default async function sitemap() {
  const pages = await fetchSanity(
    groq`*[
      _type in ['page', 'page.post'] &&
      defined(metadata.slug.current) &&
      !(metadata.slug.current in ['/', '404']) &&
      metadata.seo.nofollowAttributes != true
    ]{ 'slug': metadata.slug.current, _updatedAt }`,
    { tags: ['pages', 'posts'] }
  );
  return [
    { url: baseUrl },
    { url: `${baseUrl}/contact` },
    // Malformed and template slugs have no URL to list, and /index is not a page.
    ...pages
      .filter(({ slug }) => isPagePath(slug) && slug !== '/index')
      .map(({ slug, _updatedAt }) => ({
        url: `${baseUrl}${slug}`,
        lastModified: _updatedAt
      }))
  ];
}

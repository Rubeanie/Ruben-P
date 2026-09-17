import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { baseUrl } from '@/lib/env';

// The home and contact routes, then every indexable CMS page and post. The
// same tags as the pages themselves, so a publish refreshes the sitemap too.
export default async function sitemap() {
  const pages = await fetchSanity(
    groq`*[
      _type in ['page', 'page.post'] &&
      defined(metadata.slug.current) &&
      !(metadata.slug.current in ['index', '404']) &&
      metadata.seo.nofollowAttributes != true
    ]{ 'slug': metadata.slug.current, _updatedAt }`,
    { tags: ['pages', 'posts'] }
  );
  return [
    { url: baseUrl },
    { url: `${baseUrl}/contact` },
    ...pages.map(({ slug, _updatedAt }) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: _updatedAt
    }))
  ];
}

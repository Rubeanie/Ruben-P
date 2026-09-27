import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { baseUrl } from '@/lib/env';
import { isPagePath } from '@/lib/slug';

// The contact route, then every indexable CMS page and post (home included). The
// same tags as the pages themselves, so a publish refreshes the sitemap too.
export default async function sitemap() {
  const { pages, site } = await fetchSanity(
    groq`{
      'pages': *[
        _type in ['page', 'page.post'] &&
        defined(metadata.slug.current)
      ]{ 'slug': metadata.slug.current, 'nofollow': metadata.seo.nofollowAttributes, _updatedAt },
      'site': *[_type == 'site'][0]{ 'nofollow': seo.nofollowAttributes }
    }`,
    { tags: ['pages', 'posts', 'site'] }
  );

  const isIndexable = ({ nofollow }) => (nofollow ?? site?.nofollow) !== true;
  const isSitemapEntry = (p) =>
    isIndexable(p) && isPagePath(p.slug) && p.slug !== '/index';

  return [
    ...(site?.nofollow !== true ? [{ url: `${baseUrl}/contact` }] : []),
    ...pages.filter(isSitemapEntry).map(({ slug, _updatedAt }) => ({
      url: slug === '/' ? baseUrl : `${baseUrl}${slug}`,
      lastModified: _updatedAt
    }))
  ];
}

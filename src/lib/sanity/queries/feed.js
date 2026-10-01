import groq from 'groq';

export const feedQuery = groq`{
  'site': *[_type == 'site'][0]{
    title,
    'description': seo.metaDescription,
    'noindex': seo.nofollowAttributes
  },
  'posts': *[_type == 'page.post' && defined(metadata.slug.current)]
    | order(publishDate desc)[0...50]{
      title,
      summary,
      publishDate,
      'slug': metadata.slug.current,
      'noindex': metadata.seo.nofollowAttributes,
      'cover': cover.asset->{ url, mimeType, size },
      'categories': categories[]->title
    }
}`;

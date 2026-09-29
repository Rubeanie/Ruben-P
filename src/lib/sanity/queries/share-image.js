import groq from 'groq';

const photoQuery = groq`
  asset->{
    _id,
    url,
    metadata { palette { vibrant { background }, dominant { background } } }
  },
  hotspot { x, y, width, height },
  crop { top, bottom, left, right }
`;

// The share card's photo candidates in order: the hand-set share image, the post cover, the hero.
export const sharePhotosQuery = groq`
  "sharePhotos": [
    metadata.seo.openGraph.image{ ${photoQuery} },
    cover{ ${photoQuery} },
    select(
      modules[0]._type == 'hero' => modules[0].bgImage{ ${photoQuery} },
      modules[0]._type in ['hero.saas', 'hero.split'] => modules[0].image{ ${photoQuery} }
    )
  ]
`;

export const shareImagePageQuery = groq`*[
  _type in ['page', 'page.post'] &&
  metadata.slug.current == $path
][0]{
  _id,
  _type,
  title,
  summary,
  publishDate,
  "categories": array::compact(categories[]->{ _id, title, "color": color.hex }),
  "seo": metadata.seo{
    metaTitle,
    metaDescription,
    openGraph{ title, description }
  },
  "modules": modules[0...1]{ _type, bgImage{ asset->{ url } }, image{ asset->{ url } } },
  ${sharePhotosQuery}
}`;

// A social's vanity page is its redirect's source path.
export const shareImageSocialQuery = groq`*[
  _type == 'social' &&
  redirect->source == $path
][0]{
  _id,
  title,
  username,
  logo,
  "baseColor": baseColor.hex
}`;

export const shareImageSiteQuery = groq`*[_type == 'site'][0]{
  title,
  logo,
  "metaDescription": seo.metaDescription,
  "postCategories": postCategories[]->{ _id }
}`;

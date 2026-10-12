import groq from 'groq';
import { cloudinaryImageQuery } from './fragments/cloudinary';
import { heroImageQuery } from './fragments/hero-image';

// The share card's photo candidates in order: the hand-set share image, the post cover, the hero.
export const sharePhotosQuery = groq`
  "sharePhotos": [
    metadata.seo.openGraph.image{ ${cloudinaryImageQuery} },
    cover{ ${cloudinaryImageQuery} },
    select(
      modules[0]._type == 'hero' => modules[0].bgImage{ ${cloudinaryImageQuery} },
      modules[0]._type in ['hero.saas', 'hero.split'] => modules[0].image{ ${cloudinaryImageQuery} }
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
  "modules": modules[0...4]{ _type, html{ code }, ${heroImageQuery} },
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

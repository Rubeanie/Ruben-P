import groq from 'groq';
import { cloudinaryImageQuery } from './fragments/cloudinary';

// The share card's photo candidates in order: the hand-set share image, then the post cover.
export const sharePhotosQuery = groq`
  "sharePhotos": [
    metadata.seo.openGraph.image{ ${cloudinaryImageQuery} },
    cover{ ${cloudinaryImageQuery} }
  ]
`;

// The opening modules, whose hero is the last candidate (sharePhoto) and sets the card's theme.
export const shareModulesQuery = groq`
  "modules": modules[0...4]{
    _type,
    html{ code },
    bgImage{ ${cloudinaryImageQuery} },
    image{ ${cloudinaryImageQuery} }
  }
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
  ${shareModulesQuery},
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

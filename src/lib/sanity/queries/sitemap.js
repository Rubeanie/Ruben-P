import groq from 'groq';
import { clipQuery } from './fragments/clip';
import { cloudinaryQuery } from './fragments/cloudinary';

// Spreads skip a missing modules array, which `+` would turn into null.
export const sitemapQuery = groq`{
  'pages': *[
    _type in ['page', 'page.post'] &&
    defined(metadata.slug.current)
  ]{
    _type,
    'slug': metadata.slug.current,
    'noindex': metadata.seo.nofollowAttributes,
    'priority': metadata.seo.priority,
    _updatedAt,
    cover { asset { ${cloudinaryQuery} }, clip { ${clipQuery} } },
    'images': [
      ...modules[_type == 'hero'].bgImage.asset->url,
      ...modules[_type == 'hero'].bgImageMobile.asset->url,
      ...modules[_type == 'hero.saas'].image.asset->url,
      ...modules[_type == 'hero.split'].image.asset->url,
      ...modules[_type == 'richtext-module'].content[_type == 'imageBlock'].image.asset->url,
      ...modules[_type == 'creative-module'].columns[].blocks[_type == 'imageBlock'].image.asset->url
    ]
  },
  'site': *[_type == 'site'][0]{ 'noindex': seo.nofollowAttributes }
}`;

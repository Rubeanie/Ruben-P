import groq from 'groq';
import { cloudinaryStillQuery } from './fragments/cloudinary';
import { heroImageQuery } from './fragments/hero-image';

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
    cover { ${cloudinaryStillQuery} },
    'heroes': modules[_type in ['hero', 'hero.saas', 'hero.split']]{ _type, ${heroImageQuery} },
    'images': [
      ...modules[_type == 'richtext-module'].content[_type == 'imageBlock'].image{ ${cloudinaryStillQuery} },
      ...modules[_type == 'creative-module'].columns[].blocks[_type == 'imageBlock'].image{ ${cloudinaryStillQuery} }
    ]
  },
  'site': *[_type == 'site'][0]{ 'noindex': seo.nofollowAttributes }
}`;

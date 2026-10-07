import { groq } from '../fetch';
import { clipQuery } from './fragments/clip';
import { cloudinaryQuery } from './fragments/cloudinary';
import { sceneModelQuery, scenePosterQuery } from './fragments/scene';

// Just enough of each linked page to tell what it shows first.
const photo = groq`asset->{ url, metadata { dimensions { aspectRatio } } }`;
const heading = groq`style in ['h1', 'h1Large', 'h2', 'h3']`;
// Headings only: they decide which module an anchor belongs to.
const headings = groq`content[_type == 'block' && ${heading}]{ _type, style, children[]{ text } }`;
const picture = groq`
  imageType,
  image { asset->{ url, metadata { dimensions { width, height } } } },
  cloudinaryAsset { ${cloudinaryQuery} },
  clip { ${clipQuery} }
`;

// Every block keeps its place, so the opening counts blocks as the page draws
// them; only headings and what draws carry more than their type.
const blocks = groq`content[]{
  _type,
  _type == 'block' && ${heading} => { style, children[]{ text } },
  _type == 'imageBlock' => { ${picture} },
  _type == 'youtube' => { url, autoplay }
}`;

// The pages at $paths, for the links that lead to them.
export const introImagesQuery = groq`*[_type in ['page', 'page.post'] && metadata.slug.current in $paths]{
  "path": metadata.slug.current,
  "onPost": _type == 'page.post',
  "modules": modules[]{
    _type,
    _key,
    uid,
    html { code },
    bgImage { ${photo} },
    bgImageMobile { ${photo} },
    image { ${photo} },
    _type == 'richtext-module' => { ${blocks} },
    _type == 'callout' => { ${blocks} },
    _type == 'accordion-list' => { items[]{ summary, ${headings} } },
    _type == 'creative-module' => {
      columns[]{
        _key,
        blocks[]{
          _key,
          _type,
          _type == 'heading' => { text },
          _type == 'imageBlock' => { ${picture} },
          _type == 'copy' => { ${blocks} }
        }
      }
    },
    _type == 'three.js' => { loadOnClick, ${scenePosterQuery} },
    _type == 'media-carousel' => {
      "loop": coalesce(loop, false),
      // Every item, as the carousel counts only those it can draw.
      items[]{
        _type,
        url,
        ${picture},
        ${sceneModelQuery},
        ${scenePosterQuery}
      }
    },
    _type == 'post-featured' => { limit }
  }
}`;

import { groq } from '../../fetch';
import { cloudinaryQuery } from '../fragments/cloudinary';
import { imageQuery } from '../fragments/image';
import {
  sceneFacadeQuery,
  sceneLookQuery,
  sceneModelQuery
} from '../fragments/scene';

export const mediaCarouselQuery = groq`
  aspectRatio,
  size,
  align,
  "loop": coalesce(loop, false),
  items[]{
    _type,
    _key,
    caption,
    source,
    _type == 'carouselImage' => {
      imageType,
      image { ${imageQuery} },
      cloudinaryAsset { ${cloudinaryQuery} },
      alt
    },
    _type == 'carouselYouTube' => { url },
    _type == 'carouselScene' => {
      ${sceneModelQuery},
      ${sceneFacadeQuery},
      ${sceneLookQuery},
      alt
    }
  }
`;

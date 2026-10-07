import { groq } from '../../fetch';
import { cloudinaryImageQuery } from '../fragments/cloudinary';
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
      image { ${cloudinaryImageQuery} },
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

import { groq } from '../../fetch';
import {
  sceneFacadeQuery,
  sceneLookQuery,
  sceneModelQuery
} from '../fragments/scene';

export const threeSceneQuery = groq`
  ${sceneModelQuery},
  "loadOnClick": coalesce(loadOnClick, false),
  loadOnClick == true => { ${sceneFacadeQuery} },
  ${sceneLookQuery},
  aspectRatio, size, align, caption, source,
`;

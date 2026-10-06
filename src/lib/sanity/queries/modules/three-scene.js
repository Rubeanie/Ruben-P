import { groq } from '../../fetch';
import { sceneFacadeQuery, sceneModelQuery } from '../fragments/scene';

export const threeSceneQuery = groq`
  ${sceneModelQuery},
  "loadOnClick": coalesce(loadOnClick, false),
  loadOnClick == true => { ${sceneFacadeQuery} },
  lights { hex },
  background { hex },
  aspectRatio, size, align, caption, source,
  environmentSource,
  environmentPreset,
  "environmentBackground": environmentSource != 'theme' && environmentBackground == true,
  "environment": select(
    environmentSource == 'file' => environmentFile.asset->url,
    environmentSource == 'url' => environmentUrl,
    environmentSource == 'cloudinary' => environmentCloudinary.secure_url
  ),
  keyLight,
  "bloom": coalesce(bloom, 'off'),
  "grain": select(grain == true => 'light', grain),
  "vignette": select(vignette == true => 'light', vignette),
  orbitControls,
  zoom
`;

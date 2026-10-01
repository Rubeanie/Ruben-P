import { groq } from '../../fetch';

export const threeSceneQuery = groq`
  "model": select(
    modelSource == 'file' => modelFile.asset->url,
    modelSource == 'url' => modelUrl,
    modelSource == 'cloudinary' => modelCloudinary.secure_url
  ),
  "loadOnClick": coalesce(loadOnClick, false),
  loadOnClick == true => {
    "poster": select(
      posterSource == 'cloudinary' => posterCloudinary.secure_url,
      poster.asset->url
    ),
    "modelBytes": select(
      modelSource == 'file' => modelFile.asset->size,
      modelSource == 'cloudinary' => modelCloudinary.bytes
    )
  },
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
  "grain": coalesce(bloom, 'off') != 'off' && coalesce(grain, false),
  "vignette": coalesce(bloom, 'off') != 'off' && coalesce(vignette, false),
  orbitControls,
  zoom
`;

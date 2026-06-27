import { groq } from '../../fetch';

export const threeSceneQuery = groq`
  "model": select(
    modelSource == 'file' => modelFile.asset->url,
    modelSource == 'url' => modelUrl,
    modelSource == 'cloudinary' => modelCloudinary.secure_url
  ),
  lights { hex },
  background { hex },
  height,
  width,
  environmentSource,
  environmentPreset,
  environmentBackground,
  "environment": select(
    environmentSource == 'file' => environmentFile.asset->url,
    environmentSource == 'url' => environmentUrl,
    environmentSource == 'cloudinary' => environmentCloudinary.secure_url
  ),
  keyLight,
  orbitControls,
  zoom
`;

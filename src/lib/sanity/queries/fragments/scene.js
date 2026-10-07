import { groq } from '../../fetch';

// The chosen model source as one URL.
export const sceneModelQuery = groq`
  "model": select(
    modelSource == 'file' => modelFile.asset->url,
    modelSource == 'url' => modelUrl,
    modelSource == 'cloudinary' => modelCloudinary.secure_url
  )
`;

// The click-to-load facade's poster.
export const scenePosterQuery = groq`
  "poster": select(
    posterSource == 'cloudinary' => posterCloudinary.secure_url,
    poster.asset->url
  )
`;

// The poster and the model's size for the facade's button.
export const sceneFacadeQuery = groq`
  ${scenePosterQuery},
  "modelBytes": select(
    modelSource == 'file' => modelFile.asset->size,
    modelSource == 'cloudinary' => modelCloudinary.bytes
  )
`;

// The scene's look: backdrop, lights, image-based lighting (the HDRI as one
// URL), effects and controls.
export const sceneLookQuery = groq`
  background { hex },
  lights { hex },
  environmentSource,
  environmentPreset,
  // A box ticked before the source was cleared stays stored; it needs a source.
  "environmentBackground": defined(environmentSource) && environmentSource != 'theme' && environmentBackground == true,
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

import { groq } from '../../fetch';
import { cloudinaryImageQuery, cloudinaryStillQuery } from './cloudinary';

// The chosen model source as one URL; Cloudinary unless it's a URL, as the
// Studio shows it.
export const sceneModelQuery = groq`
  "model": select(
    modelSource == 'url' => modelUrl,
    modelCloudinary.secure_url
  )
`;

// Just the poster's still, for warming it ahead of a visit.
export const scenePosterQuery = groq`
  poster { ${cloudinaryStillQuery} }
`;

// The poster and the model's size for the click-to-load facade's button.
export const sceneFacadeQuery = groq`
  poster { ${cloudinaryImageQuery} },
  "modelBytes": select(modelSource != 'url' => modelCloudinary.bytes)
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

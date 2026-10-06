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

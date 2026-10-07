import { groq } from '../../fetch';

// A Cloudinary video's cut, beside the asset in an image field.
export const clipQuery = groq`
  start,
  length,
  fps,
  playOnce,
  animatedImage
`;

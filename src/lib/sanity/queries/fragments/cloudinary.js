import groq from 'groq';
import { clipQuery } from './clip';

export const cloudinaryQuery = groq`
  public_id,
  secure_url,
  width,
  height,
  format,
  resource_type,
  "derived_url": derived[0].secure_url,
  // Set in the Media Library on someone else's picture.
  "credit": context.custom.credit
`;

// Just what an image field's still takes: the asset and the clip's cut.
export const cloudinaryStillQuery = groq`
  asset { ${cloudinaryQuery} },
  clip { ${clipQuery} }
`;

// A Cloudinary image field, as resolveImage reads it.
export const cloudinaryImageQuery = groq`
  ${cloudinaryStillQuery},
  blur,
  palette { dominant { background }, vibrant { background } },
  focus { x, y },
  lqip
`;

import groq from 'groq';
import { clipQuery } from './clip';

export const cloudinaryQuery = groq`
  public_id,
  secure_url,
  width,
  height,
  format,
  resource_type,
  "derived_url": derived[0].secure_url
`;

// A Cloudinary image field, as resolveImage reads it.
export const cloudinaryImageQuery = groq`
  asset { ${cloudinaryQuery} },
  clip { ${clipQuery} },
  palette { dominant { background }, vibrant { background } },
  focus { x, y },
  lqip
`;

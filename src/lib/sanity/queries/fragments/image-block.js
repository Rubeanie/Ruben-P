import { groq } from '../../fetch';
import { cloudinaryImageQuery } from './cloudinary';

export const imageBlockQuery = groq`
  image { ${cloudinaryImageQuery} },
  caption,
  alt,
  source,
  size,
  align
`;

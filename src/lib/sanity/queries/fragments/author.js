import { groq } from '../../fetch';
import { cloudinaryImageQuery } from './cloudinary';
import { linkQuery } from './link';

export const authorQuery = groq`
  _id,
  name,
  photo { ${cloudinaryImageQuery} },
  link { ${linkQuery} }
`;

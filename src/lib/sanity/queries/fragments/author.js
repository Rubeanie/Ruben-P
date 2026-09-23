import { groq } from '../../fetch';
import { imageQuery } from './image';
import { linkQuery } from './link';

export const authorQuery = groq`
  _id,
  name,
  photo { ${imageQuery} },
  link { ${linkQuery} }
`;

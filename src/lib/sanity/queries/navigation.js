import { groq } from '../fetch';
import { linkQuery } from './fragments/link';

export const navigationQuery = groq`
  title,
  logoLink{ ${linkQuery} },
  items[]{ ${linkQuery} }
`;

import { groq } from '../fetch';
import { linkQuery } from './fragments/link';

export const navigationQuery = groq`
  title,
  leadLink{ ${linkQuery} },
  items[]{ ${linkQuery} },
  cta{ ${linkQuery} }
`;

import { groq } from '../../fetch';
import { linkQuery } from '../fragments/link';

export const ctaQuery = groq`
  ...,
  link{ ${linkQuery} }
`;

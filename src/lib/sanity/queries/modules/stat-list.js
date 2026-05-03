import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';

export const statListQuery = groq`
  intro[]{ ${contentQuery} },
  stats[]{
    _key,
    value,
    subValue,
    text
  },
  textAlign
`;

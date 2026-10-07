import { groq } from '../../fetch';

export const statListQuery = groq`
  stats[]{
    _key,
    value,
    subValue,
    text
  },
  textAlign
`;

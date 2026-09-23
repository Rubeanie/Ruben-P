import { groq } from '../../fetch';

export const postDetailsQuery = groq`
  authors,
  published,
  edited,
  categories
`;

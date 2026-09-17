import { groq } from '../../fetch';

export const categoryQuery = groq`
  _id,
  title,
  color { hex }
`;

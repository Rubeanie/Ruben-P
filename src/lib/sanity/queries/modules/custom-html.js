import { groq } from '../../fetch';

export const customHtmlQuery = groq`
  uid,
  className,
  html
`;

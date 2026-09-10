import { groq } from '../../fetch';

export const codeBlockQuery = groq`
  code,
  language,
  filename
`;

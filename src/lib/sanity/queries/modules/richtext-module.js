import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';

export const richtextModuleQuery = groq`
  content[]{ ${contentQuery} }
`;

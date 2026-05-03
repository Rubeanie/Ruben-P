import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { ctaQuery } from './cta';

export const calloutQuery = groq`
  content[]{ ${contentQuery} },
  cta[]{ ${ctaQuery} }
`;

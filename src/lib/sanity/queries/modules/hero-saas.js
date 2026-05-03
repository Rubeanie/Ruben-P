import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { ctaQuery } from './cta';

export const heroSaasQuery = groq`
  pretitle,
  content[]{ ${contentQuery} },
  ctas[]{ ${ctaQuery} }
`;

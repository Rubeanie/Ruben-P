import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { imageQuery } from '../fragments/image';
import { ctaQuery } from './cta';

export const heroSplitQuery = groq`
  pretitle,
  content[]{ ${contentQuery} },
  ctas[]{ ${ctaQuery} },
  image {
    ${imageQuery},
    alt,
    onRight,
    loading
  }
`;

import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { imageQuery } from '../fragments/image';
import { ctaQuery } from './cta';

export const heroQuery = groq`
  pretitle,
  content[]{ ${contentQuery} },
  ctas[]{ ${ctaQuery} },
  bgImage {
    ${imageQuery},
    alt,
    loading
  },
  bgImageMobile { ${imageQuery} },
  textAlign,
  alignItems
`;

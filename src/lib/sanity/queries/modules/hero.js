import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { cloudinaryImageQuery } from '../fragments/cloudinary';
import { ctaQuery } from './cta';

export const heroQuery = groq`
  pretitle,
  content[]{ ${contentQuery} },
  ctas[]{ ${ctaQuery} },
  bgImage { ${cloudinaryImageQuery} },
  bgImageAlt,
  "scrollHint": coalesce(scrollHint, true)
`;

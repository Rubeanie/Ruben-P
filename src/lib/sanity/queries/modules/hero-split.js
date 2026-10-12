import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { cloudinaryImageQuery } from '../fragments/cloudinary';
import { ctaQuery } from './cta';

export const heroSplitQuery = groq`
  pretitle,
  content[]{ ${contentQuery} },
  ctas[]{ ${ctaQuery} },
  image { ${cloudinaryImageQuery} },
  imageAlt,
  imageOnRight,
  "scrollHint": coalesce(scrollHint, false)
`;

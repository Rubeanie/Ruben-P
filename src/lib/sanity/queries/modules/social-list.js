import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { linkQuery } from '../fragments/link';

export const socialListQuery = groq`
  intro[]{ ${contentQuery} },
  socials[]->{
    _id,
    title,
    username,
    logo,
    baseColor { hex, rgb { r, g, b, a } },
    textColor { hex, rgb { r, g, b, a } },
    url { ${linkQuery} },
    "slug": slug.current
  }
`;

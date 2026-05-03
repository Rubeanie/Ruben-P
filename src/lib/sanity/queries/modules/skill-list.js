import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { linkQuery } from '../fragments/link';

export const skillListQuery = groq`
  intro[]{ ${contentQuery} },
  skills[]->{
    _id,
    title,
    logo,
    baseColor { hex, rgb { r, g, b, a } },
    textColor { hex, rgb { r, g, b, a } },
    url { ${linkQuery} }
  }
`;

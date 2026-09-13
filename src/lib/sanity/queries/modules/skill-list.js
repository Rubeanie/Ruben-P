import { groq } from '../../fetch';
import { linkQuery } from '../fragments/link';

export const skillListQuery = groq`
  skills[]->{
    _id,
    title,
    logo,
    baseColor { hex, rgb { r, g, b, a } },
    textColor { hex, rgb { r, g, b, a } },
    url { ${linkQuery} }
  }
`;

import { groq } from '../../fetch';
import { linkQuery } from '../fragments/link';

// Each entry keeps its own _key (the same skill may be listed twice); the
// document fields are projected explicitly through the reference.
export const skillListQuery = groq`
  skills[]{
    _key,
    ...@->{
      _id,
      title,
      logo,
      baseColor { hex },
      url { ${linkQuery} }
    }
  }
`;

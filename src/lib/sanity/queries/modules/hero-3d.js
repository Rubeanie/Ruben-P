import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';

export const hero3dQuery = groq`
  content[]{ ${contentQuery} },
  beats[]{
    _key,
    stage,
    content[]{ ${contentQuery} }
  },
  "scrollHint": coalesce(scrollHint, false)
`;

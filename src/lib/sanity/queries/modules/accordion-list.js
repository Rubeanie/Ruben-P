import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';

export const accordionListQuery = groq`
  items[]{
    _key,
    summary,
    content[]{ ${contentQuery} },
    open
  },
  layout,
  multiple
`;

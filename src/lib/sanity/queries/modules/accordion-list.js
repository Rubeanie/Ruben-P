import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';

export const accordionListQuery = groq`
  intro[]{ ${contentQuery} },
  items[]{
    _key,
    summary,
    content,
    open
  },
  layout,
  uid
`;

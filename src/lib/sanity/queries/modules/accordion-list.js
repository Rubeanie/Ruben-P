import { groq } from '../../fetch';

export const accordionListQuery = groq`
  items[]{
    _key,
    summary,
    content,
    open
  },
  layout,
  multiple,
  uid
`;

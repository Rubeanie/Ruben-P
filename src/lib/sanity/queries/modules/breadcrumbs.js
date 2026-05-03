import { groq } from '../../fetch';
import { linkQuery } from '../fragments/link';

export const breadcrumbsQuery = groq`
  crumbs[]{ ${linkQuery} }
`;

import { groq } from '../../fetch';
import { categoryQuery } from '../fragments/category';

export const postListQuery = groq`
  displayFilters,
  predefinedFilters[]->{ ${categoryQuery} }
`;

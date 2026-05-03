import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { metadataQuery } from '../metadata';

export const portfolioListQuery = groq`
  intro[]{ ${contentQuery} },
  layout,
  limit,
  displayFilters,
  predefinedFilters[]->{ _id, title },
  "posts": *[_type == 'page.portfolio'] | order(publishDate desc) {
    _id,
    title,
    featured,
    publishDate,
    categories[]->{ _id, title },
    ${metadataQuery}
  }
`;

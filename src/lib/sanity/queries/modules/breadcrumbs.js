import { groq } from '../../fetch';
import { linkQuery } from '../fragments/link';

export const breadcrumbsQuery = groq`
  "mode": coalesce(mode, "auto"),
  crumbs[]{ ${linkQuery} }
`;

export const breadcrumbAncestorsQuery = groq`
  *[_type in ["page", "page.portfolio"] && metadata.slug.current in $slugs]{
    title,
    "slug": metadata.slug.current
  }
`;

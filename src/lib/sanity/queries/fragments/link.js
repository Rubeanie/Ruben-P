import { groq } from '../../fetch';

// resolveLink only needs the target's slug, not its SEO block.
export const linkQuery = groq`
  _key,
  "label": coalesce(label, internal->title, external),
  type,
  external,
  params,
  internal->{
    _type,
    title,
    metadata { "slug": slug.current }
  }
`;

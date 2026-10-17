import { groq } from '../../fetch';

// A redirect as a link target, without `external`: see resolveRedirect.
export const redirectLinkQuery = groq`
  source,
  destination{ type, params, internal->{ metadata { "slug": slug.current } } }
`;

// resolveLink only needs the target's slug, not its SEO block.
export const linkQuery = groq`
  _key,
  "label": coalesce(
    label,
    internal->title,
    external,
    redirect->destination.label,
    redirect->destination.internal->title,
    redirect->source
  ),
  type,
  external,
  params,
  internal->{
    _type,
    title,
    metadata { "slug": slug.current }
  },
  redirect->{ ${redirectLinkQuery} }
`;

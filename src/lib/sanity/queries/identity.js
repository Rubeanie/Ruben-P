import { groq } from '../fetch';
import { authorQuery } from './fragments/author';

// Who owns the site, for the page's structured data. Socials link out through
// their redirect; only external destinations are profiles.
export const identityQuery = groq`
  title,
  alternateName,
  copyrightNotice,
  license,
  acquireLicensePage,
  author->{ ${authorQuery}, jobTitle },
  "sameAs": array::compact(*[_type == 'social' && redirect->destination.type == 'external'].redirect->destination.external)
`;

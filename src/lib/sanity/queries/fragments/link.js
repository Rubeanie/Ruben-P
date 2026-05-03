import { groq } from '../../fetch';
import { metadataQuery } from '../metadata';

export const linkQuery = groq`
  label,
  type,
  external,
  params,
  internal->{
    _type,
    title,
    ${metadataQuery},
    _type == 'social' => {
      "metadata": { "slug": slug.current }
    }
  }
`;

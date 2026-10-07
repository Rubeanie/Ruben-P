import { groq } from '../../fetch';
import { metadataQuery } from '../metadata';

export const linkQuery = groq`
  _key,
  "label": coalesce(label, internal->title, external),
  type,
  external,
  params,
  internal->{
    _type,
    title,
    ${metadataQuery}
  }
`;

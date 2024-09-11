import { groq } from '../../fetch';
import { metadataQuery } from '../metadata';

export const linkQuery = groq`
  ...,
  internal->{ _type, title, ${metadataQuery} }
`;

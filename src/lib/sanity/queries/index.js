import { fetchSanity, groq } from '../fetch';
import { metadata } from './metadata';

export const linkQuery = groq`
  ...,
  internal->{ _type, title, ${metadata} }
`;
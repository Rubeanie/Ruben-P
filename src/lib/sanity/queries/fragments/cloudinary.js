import { groq } from '../../fetch';

export const cloudinaryQuery = groq`
  public_id,
  secure_url,
  width,
  height,
  format,
  resource_type,
  "derived_url": derived[0].secure_url
`;

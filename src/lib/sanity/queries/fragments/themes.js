import { groq } from '../../fetch';

export const themesQuery = groq`
  "themes": themes[]->{
    "styles": styles[]{
      "image": coalesce(image.derived[0].secure_url, image.secure_url),
      "message": message
    }
  }.styles[]
`;

import { groq } from '../../fetch';

export const themesQuery = groq`
  "themes": themes[]->{
    "styles": styles[]{
      "image": image.secure_url,
      "message": message
    }
  }.styles[]
`;

import { groq } from '../../fetch';

export const themesQuery = groq`
  "themes": themes[]->{
    "styles": styles[]{
      "title": title,
      "image": coalesce(image.derived[0].secure_url, image.secure_url),
      "primaryColor": primaryColor.hex,
      "secondaryColor": secondaryColor.hex,
      "backgroundColor": backgroundColor.hex,
      "textColor": textColor.hex,
      "message": message
    }
  }.styles[]
`;

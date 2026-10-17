import { groq } from '../../fetch';
import { linkQuery } from './link';

export const themesQuery = groq`
  "themes": array::compact(themes[]->{
    "styles": styles[]{
      "image": coalesce(image.derived[0].secure_url, image.secure_url),
      "primaryColor": primaryColor.hex,
      "secondaryColor": secondaryColor.hex,
      "backgroundColor": backgroundColor.hex,
      "textColor": textColor.hex,
      "artist": artist->{ name, link { ${linkQuery} } },
      "photoSource": source
    }
  }.styles[])
`;

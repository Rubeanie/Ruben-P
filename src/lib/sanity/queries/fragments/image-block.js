import { groq } from '../../fetch';
import { imageQuery } from './image';
import { cloudinaryQuery } from './cloudinary';
import { clipQuery } from './clip';

export const imageBlockQuery = groq`
  imageType,
  image { ${imageQuery} },
  cloudinaryAsset { ${cloudinaryQuery} },
  clip { ${clipQuery} },
  caption,
  alt,
  source,
  loading,
  placeholder,
  size,
  align
`;

import { groq } from '../../fetch';
import { imageQuery } from './image';
import { cloudinaryQuery } from './cloudinary';

export const imageBlockQuery = groq`
  imageType,
  image { ${imageQuery} },
  cloudinaryAsset { ${cloudinaryQuery} },
  caption,
  alt,
  source,
  loading,
  placeholder,
  size,
  align
`;

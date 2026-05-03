import { groq } from '../../fetch';
import { imageBlockQuery } from './image-block';

export const contentQuery = groq`
  _type,
  _key,
  _type == 'block' => {
    style,
    children,
    markDefs,
    listItem,
    level
  },
  _type == 'imageBlock' => {
    ${imageBlockQuery}
  },
  _type == 'youtube' => {
    url,
    autoplay,
    controls
  },
  _type == 'code' => {
    code,
    language,
    filename
  }
`;

import { groq } from '../../fetch';
import { imageBlockQuery } from './image-block';
import { youtubeBlockQuery } from './youtube-block';
import { codeBlockQuery } from './code-block';

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
    ${youtubeBlockQuery}
  },
  _type == 'code' => {
    ${codeBlockQuery}
  }
`;

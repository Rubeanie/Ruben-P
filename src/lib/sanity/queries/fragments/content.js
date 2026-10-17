import { groq } from '../../fetch';
import { imageBlockQuery } from './image-block';
import { youtubeBlockQuery } from './youtube-block';
import { codeBlockQuery } from './code-block';
import { linkQuery } from './link';

// Annotations are the site's link object; `_type` stays so each mark keeps
// its component.
const markDefQuery = groq`
  _type,
  ${linkQuery}
`;

export const contentQuery = groq`
  _type,
  _key,
  _type == 'block' => {
    style,
    children,
    markDefs[]{ ${markDefQuery} },
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

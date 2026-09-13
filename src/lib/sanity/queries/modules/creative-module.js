import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { imageBlockQuery } from '../fragments/image-block';
import { ctaQuery } from './cta';

export const creativeModuleQuery = groq`
  modules {
    colSpan,
    subModules[]{
      _type,
      _key,
      _type == 'ctas' => {
        ctas[]{ ${ctaQuery} }
      },
      _type == 'icon' => {
        alt,
        icon,
        size
      },
      _type == 'image' => {
        ${imageBlockQuery}
      },
      _type == 'richtext' => {
        content[]{ ${contentQuery} }
      },
      _type == 'custom-html' => {
        uid,
        className,
        html
      }
    }
  },
  columns,
  bordered,
  textAlign,
  alignItems
`;
